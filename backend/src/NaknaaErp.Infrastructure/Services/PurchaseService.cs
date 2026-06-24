using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Purchases;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class PurchaseService : IPurchaseService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public PurchaseService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PurchaseListItemDto>> GetAllAsync(
        PurchaseListQuery query,
        CancellationToken cancellationToken = default)
    {
        var purchasesQuery = _context.Purchases
            .AsNoTracking()
            .Include(x => x.Supplier)
            .Include(x => x.Warehouse)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            purchasesQuery = purchasesQuery.Where(x =>
                x.PurchaseNumber.ToLower().Contains(search) ||
                x.Supplier.SupplierName.ToLower().Contains(search));
        }

        if (query.WarehouseId.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.WarehouseId == query.WarehouseId);
        }

        if (query.Status.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.Status == query.Status);
        }

        if (query.DateFrom.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.PurchaseDate >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.PurchaseDate <= query.DateTo);
        }

        var total = await purchasesQuery.CountAsync(cancellationToken);
        var items = await purchasesQuery
            .OrderByDescending(x => x.PurchaseDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new PurchaseListItemDto
            {
                Id = x.Id,
                PurchaseNumber = x.PurchaseNumber,
                SupplierId = x.SupplierId,
                SupplierName = x.Supplier.SupplierName,
                WarehouseId = x.WarehouseId,
                WarehouseName = x.Warehouse.WarehouseName,
                PurchaseDate = x.PurchaseDate,
                TotalAmount = x.TotalAmount,
                Status = x.Status,
                Notes = x.Notes,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<PurchaseListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<PurchaseDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var purchase = await _context.Purchases
            .AsNoTracking()
            .Include(x => x.Supplier)
            .Include(x => x.Warehouse)
            .Include(x => x.Items).ThenInclude(x => x.ProductVariant).ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Purchase", id);

        return MapDetail(purchase);
    }

    public async Task<PurchaseDetailDto> CreateAsync(
        CreatePurchaseRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateReferencesAsync(request.SupplierId, request.WarehouseId, cancellationToken);

        var purchaseNumber = await SequenceGenerator.NextAsync(
            _context, "purchase", "PO", "PO-{year}-{sequence}", cancellationToken);

        var purchase = new Purchase
        {
            PurchaseNumber = purchaseNumber,
            SupplierId = request.SupplierId,
            WarehouseId = request.WarehouseId,
            PurchaseDate = request.PurchaseDate,
            Status = request.Status,
            Notes = request.Notes,
            Items = request.Items.Select(item => new PurchaseItem
            {
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                ReceivedQuantity = request.Status == PurchaseStatus.Received ? item.Quantity : 0,
                CostPrice = item.CostPrice,
                TotalCost = item.CostPrice * item.Quantity
            }).ToList()
        };

        purchase.TotalAmount = purchase.Items.Sum(x => x.TotalCost);

        await _unitOfWork.Purchases.AddAsync(purchase, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (request.Status == PurchaseStatus.Received)
        {
            await ApplyInventoryForPurchaseAsync(purchase, request.Items, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GetByIdAsync(purchase.Id, cancellationToken);
    }

    public async Task<PurchaseDetailDto> UpdateAsync(
        Guid id,
        UpdatePurchaseRequest request,
        CancellationToken cancellationToken = default)
    {
        var purchase = await _context.Purchases
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Purchase", id);

        if (purchase.Status == PurchaseStatus.Received)
        {
            throw new ValidationException("Received purchases cannot be modified.");
        }

        await ValidateReferencesAsync(request.SupplierId, request.WarehouseId, cancellationToken);

        purchase.SupplierId = request.SupplierId;
        purchase.WarehouseId = request.WarehouseId;
        purchase.PurchaseDate = request.PurchaseDate;
        purchase.Notes = request.Notes;

        _context.PurchaseItems.RemoveRange(purchase.Items);
        purchase.Items = request.Items.Select(item => new PurchaseItem
        {
            PurchaseId = purchase.Id,
            ProductVariantId = item.ProductVariantId,
            Quantity = item.Quantity,
            ReceivedQuantity = request.Status == PurchaseStatus.Received ? item.Quantity : 0,
            CostPrice = item.CostPrice,
            TotalCost = item.CostPrice * item.Quantity
        }).ToList();

        purchase.TotalAmount = purchase.Items.Sum(x => x.TotalCost);
        purchase.Status = request.Status;

        _unitOfWork.Purchases.Update(purchase);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (request.Status == PurchaseStatus.Received)
        {
            await ApplyInventoryForPurchaseAsync(purchase, request.Items, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<PurchaseDetailDto> ReceiveAsync(
        ReceivePurchaseRequest request,
        CancellationToken cancellationToken = default)
    {
        var purchase = await _context.Purchases
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == request.PurchaseId, cancellationToken)
            ?? throw new NotFoundException("Purchase", request.PurchaseId);

        foreach (var receiveItem in request.Items)
        {
            var item = purchase.Items.FirstOrDefault(x => x.Id == receiveItem.PurchaseItemId)
                ?? throw new NotFoundException("PurchaseItem", receiveItem.PurchaseItemId);

            var remaining = item.Quantity - item.ReceivedQuantity;
            if (receiveItem.Quantity > remaining)
            {
                throw new ValidationException($"Cannot receive more than remaining quantity for item {item.Id}.");
            }

            item.ReceivedQuantity += receiveItem.Quantity;

            var variant = await _context.ProductVariants.FirstAsync(x => x.Id == item.ProductVariantId, cancellationToken);
            await InventoryManager.ApplyStockChangeAsync(
                _context,
                item.ProductVariantId,
                purchase.WarehouseId,
                "MAIN", "R1", "B1",
                receiveItem.Quantity,
                InventoryTransactionType.PurchaseReceive,
                purchase.PurchaseNumber,
                purchase.Notes,
                _currentUserService.BranchId,
                _currentUserService.UserId,
                variant.ReorderLevel,
                cancellationToken);
        }

        purchase.Status = purchase.Items.All(x => x.ReceivedQuantity >= x.Quantity)
            ? PurchaseStatus.Received
            : PurchaseStatus.Ordered;

        _unitOfWork.Purchases.Update(purchase);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(purchase.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var purchase = await _context.Purchases
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Purchase", id);

        if (purchase.Status == PurchaseStatus.Received)
        {
            throw new ValidationException("Received purchases cannot be deleted.");
        }

        _context.PurchaseItems.RemoveRange(purchase.Items);
        _unitOfWork.Purchases.Remove(purchase);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<PurchaseDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var purchases = await _context.Purchases.AsNoTracking().ToListAsync(cancellationToken);
        return new PurchaseDashboardSummaryDto
        {
            TotalPurchases = purchases.Count(x => x.Status != PurchaseStatus.Cancelled),
            PurchaseValue = purchases.Where(x => x.Status != PurchaseStatus.Cancelled).Sum(x => x.TotalAmount),
            PendingPurchases = purchases.Count(x => x.Status is PurchaseStatus.Draft or PurchaseStatus.Ordered),
            ReceivedPurchases = purchases.Count(x => x.Status == PurchaseStatus.Received)
        };
    }

    public async Task<PurchaseReportsDto> GetReportsAsync(
        PurchaseReportQuery query,
        CancellationToken cancellationToken = default)
    {
        var purchasesQuery = _context.Purchases
            .AsNoTracking()
            .Include(x => x.Supplier)
            .Include(x => x.Warehouse)
            .Where(x => x.Status != PurchaseStatus.Cancelled);

        if (query.DateFrom.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.PurchaseDate >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.PurchaseDate <= query.DateTo);
        }

        if (query.WarehouseId.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.WarehouseId == query.WarehouseId);
        }

        if (query.SupplierId.HasValue)
        {
            purchasesQuery = purchasesQuery.Where(x => x.SupplierId == query.SupplierId);
        }

        var purchases = await purchasesQuery.ToListAsync(cancellationToken);

        return new PurchaseReportsDto
        {
            TotalPurchases = purchases.Count,
            TotalPurchaseValue = purchases.Sum(x => x.TotalAmount),
            BySupplier = purchases.GroupBy(x => new { x.SupplierId, x.Supplier.SupplierName })
                .Select(g => new PurchaseBySupplierReportDto
                {
                    SupplierId = g.Key.SupplierId,
                    SupplierName = g.Key.SupplierName,
                    TotalPurchases = g.Count(),
                    TotalAmount = g.Sum(x => x.TotalAmount)
                }).ToList(),
            ByWarehouse = purchases.GroupBy(x => new { x.WarehouseId, x.Warehouse.WarehouseName })
                .Select(g => new PurchaseByWarehouseReportDto
                {
                    WarehouseId = g.Key.WarehouseId,
                    WarehouseName = g.Key.WarehouseName,
                    TotalPurchases = g.Count(),
                    TotalAmount = g.Sum(x => x.TotalAmount)
                }).ToList(),
            Monthly = purchases.GroupBy(x => x.PurchaseDate.ToString("yyyy-MM"))
                .Select(g => new MonthlyPurchaseReportDto
                {
                    Month = g.Key,
                    Purchases = g.Count(),
                    Value = g.Sum(x => x.TotalAmount)
                })
                .OrderBy(x => x.Month)
                .ToList()
        };
    }

    private async Task ValidateReferencesAsync(Guid supplierId, Guid warehouseId, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.Suppliers.GetByIdAsync(supplierId, cancellationToken)
            ?? throw new NotFoundException("Supplier", supplierId);
        _ = await _unitOfWork.Warehouses.GetByIdAsync(warehouseId, cancellationToken)
            ?? throw new NotFoundException("Warehouse", warehouseId);
    }

    private async Task ApplyInventoryForPurchaseAsync(
        Purchase purchase,
        IReadOnlyList<PurchaseItemRequest> items,
        CancellationToken cancellationToken)
    {
        foreach (var item in purchase.Items)
        {
            var requestItem = items.FirstOrDefault(x => x.ProductVariantId == item.ProductVariantId);
            var section = requestItem?.Section ?? "MAIN";
            var rack = requestItem?.Rack ?? "R1";
            var bin = requestItem?.Bin ?? "B1";
            var quantity = item.ReceivedQuantity > 0 ? item.ReceivedQuantity : item.Quantity;

            var variant = await _context.ProductVariants.FirstAsync(x => x.Id == item.ProductVariantId, cancellationToken);
            await InventoryManager.ApplyStockChangeAsync(
                _context,
                item.ProductVariantId,
                purchase.WarehouseId,
                section,
                rack,
                bin,
                quantity,
                InventoryTransactionType.PurchaseReceive,
                purchase.PurchaseNumber,
                purchase.Notes,
                _currentUserService.BranchId,
                _currentUserService.UserId,
                variant.ReorderLevel,
                cancellationToken);
        }
    }

    private PurchaseDetailDto MapDetail(Purchase purchase)
    {
        var items = purchase.Items.Select(item => new PurchaseItemDto
        {
            Id = item.Id,
            PurchaseId = item.PurchaseId,
            ProductVariantId = item.ProductVariantId,
            ProductName = item.ProductVariant?.Product?.ProductName ?? string.Empty,
            VariantName = item.ProductVariant?.VariantName ?? string.Empty,
            Quantity = item.Quantity,
            ReceivedQuantity = item.ReceivedQuantity,
            CostPrice = item.CostPrice,
            TotalCost = item.TotalCost
        }).ToList();

        return new PurchaseDetailDto
        {
            Id = purchase.Id,
            PurchaseNumber = purchase.PurchaseNumber,
            SupplierId = purchase.SupplierId,
            SupplierName = purchase.Supplier.SupplierName,
            WarehouseId = purchase.WarehouseId,
            WarehouseName = purchase.Warehouse.WarehouseName,
            PurchaseDate = purchase.PurchaseDate,
            TotalAmount = purchase.TotalAmount,
            Status = purchase.Status,
            Notes = purchase.Notes,
            CreatedAt = purchase.CreatedAt,
            Items = items
        };
    }
}
