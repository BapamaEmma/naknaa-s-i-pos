using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Inventory;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public InventoryService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<InventoryListItemDto>> GetAllAsync(
        InventoryListQuery query,
        CancellationToken cancellationToken = default)
    {
        var recordsQuery = _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product).ThenInclude(x => x.Category)
            .Include(x => x.Warehouse)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            recordsQuery = recordsQuery.Where(x =>
                x.ProductVariant.Product.ProductName.ToLower().Contains(search) ||
                x.ProductVariant.VariantName.ToLower().Contains(search) ||
                x.ProductVariant.Product.ProductCode.ToLower().Contains(search));
        }

        if (query.CategoryId.HasValue)
        {
            recordsQuery = recordsQuery.Where(x => x.ProductVariant.Product.CategoryId == query.CategoryId);
        }

        if (query.WarehouseId.HasValue)
        {
            recordsQuery = recordsQuery.Where(x => x.WarehouseId == query.WarehouseId);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && query.Status != "all")
        {
            recordsQuery = query.Status switch
            {
                "in_stock" => recordsQuery.Where(x => x.Quantity > x.MinimumStockLevel),
                "low_stock" => recordsQuery.Where(x => x.Quantity > 0 && x.Quantity <= x.MinimumStockLevel),
                "out_of_stock" => recordsQuery.Where(x => x.Quantity <= 0),
                _ => recordsQuery
            };
        }

        var total = await recordsQuery.CountAsync(cancellationToken);
        var items = await recordsQuery
            .OrderBy(x => x.ProductVariant.Product.ProductName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new InventoryListItemDto
            {
                Id = x.Id,
                ProductVariantId = x.ProductVariantId,
                ProductId = x.ProductVariant.ProductId,
                ProductName = x.ProductVariant.Product.ProductName,
                VariantName = x.ProductVariant.VariantName,
                VariantValue = x.ProductVariant.VariantValue,
                CategoryId = x.ProductVariant.Product.CategoryId,
                CategoryName = x.ProductVariant.Product.Category.Name,
                Brand = x.ProductVariant.Product.Brand,
                WarehouseId = x.WarehouseId,
                WarehouseName = x.Warehouse.WarehouseName,
                Section = x.Section,
                Rack = x.Rack,
                Bin = x.Bin,
                Quantity = x.Quantity,
                MinimumStockLevel = x.MinimumStockLevel,
                UnitCost = x.ProductVariant.CostPrice,
                StockValue = x.Quantity * x.ProductVariant.CostPrice,
                Status = InventoryManager.GetStockStatus(x.Quantity, x.MinimumStockLevel),
                LastUpdated = x.UpdatedAt ?? x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<InventoryListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<InventoryDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var records = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant)
            .ToListAsync(cancellationToken);

        return new InventoryDashboardSummaryDto
        {
            TotalProducts = records.Select(x => x.ProductVariantId).Distinct().Count(),
            TotalStockQuantity = records.Sum(x => x.Quantity),
            InventoryValue = records.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
            LowStockProducts = records.Count(x => x.Quantity > 0 && x.Quantity <= x.MinimumStockLevel),
            OutOfStockProducts = records.Count(x => x.Quantity <= 0)
        };
    }

    public async Task<PagedResult<InventoryTransactionDto>> GetHistoryAsync(
        InventoryHistoryQuery query,
        CancellationToken cancellationToken = default)
    {
        var historyQuery = _context.InventoryTransactions
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product)
            .Include(x => x.Warehouse)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            historyQuery = historyQuery.Where(x =>
                x.ProductVariant.Product.ProductName.ToLower().Contains(search) ||
                (x.ReferenceNumber != null && x.ReferenceNumber.ToLower().Contains(search)));
        }

        if (query.WarehouseId.HasValue)
        {
            historyQuery = historyQuery.Where(x => x.WarehouseId == query.WarehouseId);
        }

        if (query.ProductVariantId.HasValue)
        {
            historyQuery = historyQuery.Where(x => x.ProductVariantId == query.ProductVariantId);
        }

        if (query.TransactionType.HasValue)
        {
            historyQuery = historyQuery.Where(x => x.TransactionType == query.TransactionType);
        }

        if (query.DateFrom.HasValue)
        {
            historyQuery = historyQuery.Where(x => x.CreatedAt >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            historyQuery = historyQuery.Where(x => x.CreatedAt <= query.DateTo);
        }

        var total = await historyQuery.CountAsync(cancellationToken);
        var items = await historyQuery
            .OrderByDescending(x => x.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new InventoryTransactionDto
            {
                Id = x.Id,
                ProductVariantId = x.ProductVariantId,
                ProductName = x.ProductVariant.Product.ProductName,
                VariantName = x.ProductVariant.VariantName,
                WarehouseId = x.WarehouseId,
                WarehouseName = x.Warehouse.WarehouseName,
                TransactionType = x.TransactionType,
                Quantity = x.Quantity,
                QuantityBefore = x.QuantityBefore,
                QuantityAfter = x.QuantityAfter,
                ReferenceNumber = x.ReferenceNumber,
                Notes = x.Notes,
                UserId = x.CreatedBy,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<InventoryTransactionDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<InventoryTransactionDto> StockInAsync(
        StockInRequest request,
        CancellationToken cancellationToken = default)
    {
        var variant = await _context.ProductVariants
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == request.ProductVariantId, cancellationToken)
            ?? throw new NotFoundException("ProductVariant", request.ProductVariantId);

        var transaction = await InventoryManager.ApplyStockChangeAsync(
            _context,
            request.ProductVariantId,
            request.WarehouseId,
            request.Section,
            request.Rack,
            request.Bin,
            request.Quantity,
            InventoryTransactionType.StockIn,
            null,
            request.Notes ?? request.Supplier,
            _currentUserService.BranchId,
            _currentUserService.UserId,
            variant.ReorderLevel,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await MapTransactionAsync(transaction.Id, cancellationToken);
    }

    public async Task<InventoryTransactionDto> StockOutAsync(
        StockOutRequest request,
        CancellationToken cancellationToken = default)
    {
        await InventoryManager.DeductStockAsync(
            _context,
            request.ProductVariantId,
            request.Quantity,
            InventoryTransactionType.StockOut,
            request.Reason,
            _currentUserService.BranchId,
            _currentUserService.UserId,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var latest = await _context.InventoryTransactions
            .OrderByDescending(x => x.CreatedAt)
            .FirstAsync(cancellationToken);
        return await MapTransactionAsync(latest.Id, cancellationToken);
    }

    public async Task<InventoryTransactionDto> AdjustAsync(
        InventoryAdjustmentRequest request,
        CancellationToken cancellationToken = default)
    {
        var record = await _context.InventoryRecords
            .FirstOrDefaultAsync(
                x => x.ProductVariantId == request.ProductVariantId && x.WarehouseId == request.WarehouseId,
                cancellationToken)
            ?? throw new NotFoundException("Inventory record not found for the specified variant and warehouse.");

        var change = request.NewQuantity - record.Quantity;
        var transaction = await InventoryManager.ApplyStockChangeAsync(
            _context,
            request.ProductVariantId,
            request.WarehouseId,
            record.Section,
            record.Rack,
            record.Bin,
            change,
            InventoryTransactionType.Adjustment,
            request.Reason,
            request.Reason,
            _currentUserService.BranchId,
            _currentUserService.UserId,
            record.MinimumStockLevel,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await MapTransactionAsync(transaction.Id, cancellationToken);
    }

    public async Task<ProductAvailabilitySearchResultDto> SearchAvailabilityAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        if (Guid.TryParse(query, out var productId))
        {
            return await LocateProductAsync(productId, cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(query))
        {
            return new ProductAvailabilitySearchResultDto
            {
                Status = "error",
                Message = "Search query is required.",
                Query = query
            };
        }

        var search = query.Trim().ToLower();
        var products = await _context.Products
            .AsNoTracking()
            .Include(x => x.Variants)
            .Where(x =>
                x.ProductName.ToLower().Contains(search) ||
                x.ProductCode.ToLower().Contains(search) ||
                x.Brand.ToLower().Contains(search))
            .Take(20)
            .ToListAsync(cancellationToken);

        var results = new List<ProductLocatorResultDto>();
        foreach (var product in products)
        {
            results.Add(await BuildLocatorResultAsync(product.Id, cancellationToken));
        }

        return new ProductAvailabilitySearchResultDto
        {
            Status = results.Count > 0 ? "success" : "not_found",
            Message = results.Count > 0 ? $"{results.Count} product(s) found." : "No products matched your search.",
            Query = query,
            Results = results
        };
    }

    public async Task<ProductAvailabilitySearchResultDto> LocateProductAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return new ProductAvailabilitySearchResultDto
            {
                Status = "not_found",
                Message = "Product not found.",
                Query = productId.ToString()
            };
        }

        var result = await BuildLocatorResultAsync(productId, cancellationToken);
        return new ProductAvailabilitySearchResultDto
        {
            Status = result.TotalQuantity > 0 ? "success" : "out_of_stock",
            Message = result.TotalQuantity > 0
                ? $"Product located across {result.Locations.Count} warehouse location(s)."
                : "Product found but currently out of stock.",
            Query = productId.ToString(),
            Results = [result]
        };
    }

    private async Task<ProductLocatorResultDto> BuildLocatorResultAsync(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(x => x.Variants)
            .FirstAsync(x => x.Id == productId, cancellationToken);

        var variantIds = product.Variants.Select(x => x.Id).ToList();
        var records = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.Warehouse)
            .Where(x => variantIds.Contains(x.ProductVariantId) && x.Quantity > 0)
            .ToListAsync(cancellationToken);

        var primaryVariant = product.Variants.FirstOrDefault();
        var locations = records
            .Select(record => new ProductLocationDto
            {
                WarehouseId = record.WarehouseId,
                Warehouse = record.Warehouse.WarehouseName,
                WarehouseName = record.Warehouse.WarehouseName,
                Section = record.Section,
                Rack = record.Rack,
                Bin = record.Bin,
                Quantity = record.Quantity
            })
            .ToList();

        return new ProductLocatorResultDto
        {
            ProductId = product.Id,
            ProductName = product.ProductName,
            Brand = product.Brand,
            ProductVariantId = primaryVariant?.Id ?? Guid.Empty,
            VariantName = primaryVariant?.VariantName ?? string.Empty,
            Locations = locations,
            TotalQuantity = records.Sum(x => x.Quantity)
        };
    }

    private async Task<InventoryTransactionDto> MapTransactionAsync(Guid id, CancellationToken cancellationToken)
    {
        var x = await _context.InventoryTransactions
            .AsNoTracking()
            .Include(t => t.ProductVariant).ThenInclude(v => v.Product)
            .Include(t => t.Warehouse)
            .FirstAsync(t => t.Id == id, cancellationToken);

        return new InventoryTransactionDto
        {
            Id = x.Id,
            ProductVariantId = x.ProductVariantId,
            ProductName = x.ProductVariant.Product.ProductName,
            VariantName = x.ProductVariant.VariantName,
            WarehouseId = x.WarehouseId,
            WarehouseName = x.Warehouse.WarehouseName,
            TransactionType = x.TransactionType,
            Quantity = x.Quantity,
            QuantityBefore = x.QuantityBefore,
            QuantityAfter = x.QuantityAfter,
            ReferenceNumber = x.ReferenceNumber,
            Notes = x.Notes,
            UserId = x.CreatedBy,
            CreatedAt = x.CreatedAt
        };
    }
}
