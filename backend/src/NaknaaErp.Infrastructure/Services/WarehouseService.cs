using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Warehouses;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class WarehouseService : IWarehouseService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public WarehouseService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<WarehouseListItemDto>> GetAllAsync(
        WarehouseListQuery query,
        CancellationToken cancellationToken = default)
    {
        var warehousesQuery = _context.Warehouses.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            warehousesQuery = warehousesQuery.Where(x =>
                x.WarehouseName.ToLower().Contains(search) ||
                x.WarehouseCode.ToLower().Contains(search));
        }

        if (query.Status.HasValue)
        {
            warehousesQuery = warehousesQuery.Where(x => x.Status == query.Status);
        }

        var total = await warehousesQuery.CountAsync(cancellationToken);
        var warehouses = await warehousesQuery
            .OrderBy(x => x.WarehouseName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<WarehouseListItemDto>();
        foreach (var warehouse in warehouses)
        {
            items.Add(await MapListItemAsync(warehouse, cancellationToken));
        }

        return new PagedResult<WarehouseListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<WarehouseDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _context.Warehouses.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Warehouse", id);

        return await MapDetailAsync(warehouse, cancellationToken);
    }

    public async Task<WarehouseDetailDto> CreateAsync(
        CreateWarehouseRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = await SequenceGenerator.NextAsync(
            _context, "warehouse", "WH", "WH-{sequence}", cancellationToken);

        var warehouse = new Warehouse
        {
            WarehouseCode = code,
            WarehouseName = request.WarehouseName,
            Description = request.Description,
            Address = request.Address,
            Manager = request.Manager,
            Status = request.Status
        };

        await _unitOfWork.Warehouses.AddAsync(warehouse, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(warehouse.Id, cancellationToken);
    }

    public async Task<WarehouseDetailDto> UpdateAsync(
        Guid id,
        UpdateWarehouseRequest request,
        CancellationToken cancellationToken = default)
    {
        var warehouse = await _context.Warehouses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Warehouse", id);

        warehouse.WarehouseName = request.WarehouseName;
        warehouse.Description = request.Description;
        warehouse.Address = request.Address;
        warehouse.Manager = request.Manager;
        warehouse.Status = request.Status;

        _unitOfWork.Warehouses.Update(warehouse);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Warehouse", id);
        warehouse.Status = EntityStatus.Inactive;
        _unitOfWork.Warehouses.Update(warehouse);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<WarehouseDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var records = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant)
            .ToListAsync(cancellationToken);

        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var transfers = await _context.InventoryTransactions
            .CountAsync(
                x => x.TransactionType == InventoryTransactionType.Transfer && x.CreatedAt >= monthStart,
                cancellationToken);

        return new WarehouseDashboardSummaryDto
        {
            TotalWarehouses = await _context.Warehouses.CountAsync(x => x.Status == EntityStatus.Active, cancellationToken),
            TotalInventoryQuantity = records.Sum(x => x.Quantity),
            TotalInventoryValue = records.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
            LowStockItems = records.Count(x => x.Quantity > 0 && x.Quantity <= x.MinimumStockLevel),
            TransfersThisMonth = transfers
        };
    }

    public async Task<PagedResult<WarehouseStockRecordDto>> GetInventoryAsync(
        Guid warehouseId,
        InventoryLocationQuery query,
        CancellationToken cancellationToken = default)
    {
        var recordsQuery = _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product)
            .Include(x => x.Warehouse)
            .Where(x => x.WarehouseId == warehouseId);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            recordsQuery = recordsQuery.Where(x =>
                x.ProductVariant.Product.ProductName.ToLower().Contains(search) ||
                x.ProductVariant.VariantName.ToLower().Contains(search));
        }

        if (query.CategoryId.HasValue)
        {
            recordsQuery = recordsQuery.Where(x => x.ProductVariant.Product.CategoryId == query.CategoryId);
        }

        var total = await recordsQuery.CountAsync(cancellationToken);
        var items = await recordsQuery
            .OrderBy(x => x.ProductVariant.Product.ProductName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new WarehouseStockRecordDto
            {
                Id = x.Id,
                WarehouseId = x.WarehouseId,
                WarehouseName = x.Warehouse.WarehouseName,
                Section = x.Section,
                Rack = x.Rack,
                Bin = x.Bin,
                ProductId = x.ProductVariant.ProductId,
                ProductName = x.ProductVariant.Product.ProductName,
                ProductVariantId = x.ProductVariantId,
                VariantName = x.ProductVariant.VariantName,
                Brand = x.ProductVariant.Product.Brand,
                Quantity = x.Quantity,
                UnitCost = x.ProductVariant.CostPrice
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<WarehouseStockRecordDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<PagedResult<WarehouseTransferDto>> GetTransfersAsync(
        TransferListQuery query,
        CancellationToken cancellationToken = default)
    {
        var transfersQuery = _context.InventoryTransactions
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product)
            .Include(x => x.Warehouse)
            .Where(x => x.TransactionType == InventoryTransactionType.Transfer);

        var total = await transfersQuery.CountAsync(cancellationToken);
        var transactions = await transfersQuery
            .OrderByDescending(x => x.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<WarehouseTransferDto>();
        foreach (var transaction in transactions)
        {
            var paired = await _context.InventoryTransactions.AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.ReferenceNumber == transaction.ReferenceNumber &&
                         x.Id != transaction.Id &&
                         x.TransactionType == InventoryTransactionType.Transfer,
                    cancellationToken);

            items.Add(new WarehouseTransferDto
            {
                Id = transaction.Id,
                TransferNumber = transaction.ReferenceNumber ?? transaction.Id.ToString(),
                ProductVariantId = transaction.ProductVariantId,
                ProductName = transaction.ProductVariant.Product.ProductName,
                VariantName = transaction.ProductVariant.VariantName,
                FromWarehouseId = transaction.QuantityAfter < transaction.QuantityBefore ? transaction.WarehouseId : paired?.WarehouseId ?? Guid.Empty,
                FromWarehouseName = transaction.QuantityAfter < transaction.QuantityBefore ? transaction.Warehouse.WarehouseName : string.Empty,
                ToWarehouseId = transaction.QuantityAfter > transaction.QuantityBefore ? transaction.WarehouseId : paired?.WarehouseId ?? Guid.Empty,
                ToWarehouseName = transaction.QuantityAfter > transaction.QuantityBefore ? transaction.Warehouse.WarehouseName : string.Empty,
                Quantity = transaction.Quantity,
                Reason = transaction.Notes ?? string.Empty,
                Notes = transaction.Notes,
                UserId = transaction.CreatedBy ?? Guid.Empty,
                UserName = string.Empty,
                CreatedAt = transaction.CreatedAt
            });
        }

        return new PagedResult<WarehouseTransferDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<WarehouseTransferDto> CreateTransferAsync(
        CreateTransferRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.FromWarehouseId == request.ToWarehouseId)
        {
            throw new ValidationException("Source and destination warehouses must be different.");
        }

        var transferNumber = await SequenceGenerator.NextAsync(
            _context, "transfer", "TRF", "TRF-{year}-{sequence}", cancellationToken);

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await InventoryManager.ApplyStockChangeAsync(
                _context,
                request.ProductVariantId,
                request.FromWarehouseId,
                "MAIN", "R1", "B1",
                -request.Quantity,
                InventoryTransactionType.Transfer,
                transferNumber,
                request.Reason,
                _currentUserService.BranchId,
                _currentUserService.UserId,
                0,
                cancellationToken);

            await InventoryManager.ApplyStockChangeAsync(
                _context,
                request.ProductVariantId,
                request.ToWarehouseId,
                "MAIN", "R1", "B1",
                request.Quantity,
                InventoryTransactionType.Transfer,
                transferNumber,
                request.Notes ?? request.Reason,
                _currentUserService.BranchId,
                _currentUserService.UserId,
                0,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }

        var result = await GetTransfersAsync(new TransferListQuery { Page = 1, PageSize = 1 }, cancellationToken);
        return result.Items.FirstOrDefault(x => x.TransferNumber == transferNumber)
            ?? new WarehouseTransferDto
            {
                TransferNumber = transferNumber,
                ProductVariantId = request.ProductVariantId,
                FromWarehouseId = request.FromWarehouseId,
                ToWarehouseId = request.ToWarehouseId,
                Quantity = request.Quantity,
                Reason = request.Reason,
                Notes = request.Notes,
                UserId = _currentUserService.UserId ?? Guid.Empty,
                CreatedAt = DateTime.UtcNow
            };
    }

    private async Task<WarehouseListItemDto> MapListItemAsync(Warehouse warehouse, CancellationToken cancellationToken)
    {
        var records = await _context.InventoryRecords
            .AsNoTracking()
            .Where(x => x.WarehouseId == warehouse.Id)
            .ToListAsync(cancellationToken);

        return new WarehouseListItemDto
        {
            Id = warehouse.Id,
            WarehouseCode = warehouse.WarehouseCode,
            WarehouseName = warehouse.WarehouseName,
            Description = warehouse.Description,
            TotalProducts = records.Where(x => x.Quantity > 0).Select(x => x.ProductVariantId).Distinct().Count(),
            TotalStockQuantity = records.Sum(x => x.Quantity),
            Status = warehouse.Status
        };
    }

    private async Task<WarehouseDetailDto> MapDetailAsync(Warehouse warehouse, CancellationToken cancellationToken)
    {
        var records = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant)
            .Where(x => x.WarehouseId == warehouse.Id)
            .ToListAsync(cancellationToken);

        return new WarehouseDetailDto
        {
            Id = warehouse.Id,
            WarehouseCode = warehouse.WarehouseCode,
            WarehouseName = warehouse.WarehouseName,
            Description = warehouse.Description,
            Address = warehouse.Address,
            Manager = warehouse.Manager,
            Status = warehouse.Status,
            TotalProducts = records.Where(x => x.Quantity > 0).Select(x => x.ProductVariantId).Distinct().Count(),
            TotalStockQuantity = records.Sum(x => x.Quantity),
            InventoryValue = records.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
            CreatedAt = warehouse.CreatedAt,
            UpdatedAt = warehouse.UpdatedAt
        };
    }
}
