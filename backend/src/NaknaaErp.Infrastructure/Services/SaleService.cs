using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Sales;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class SaleService : ISaleService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IProductService _productService;

    public SaleService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IProductService productService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _productService = productService;
    }

    public async Task<PagedResult<SaleListItemDto>> GetAllAsync(
        SaleListQuery query,
        CancellationToken cancellationToken = default)
    {
        var salesQuery = _context.Sales
            .AsNoTracking()
            .Include(x => x.Branch)
            .Include(x => x.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            salesQuery = salesQuery.Where(x =>
                x.ReceiptNumber.ToLower().Contains(search) ||
                x.SaleNumber.ToLower().Contains(search) ||
                (x.CustomerName != null && x.CustomerName.ToLower().Contains(search)));
        }

        if (query.DateFrom.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.SaleDate >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.SaleDate <= query.DateTo);
        }

        if (query.CustomerId.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.CustomerId == query.CustomerId);
        }

        if (query.UserId.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.UserId == query.UserId);
        }

        if (query.PaymentMethod.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.PaymentMethod == query.PaymentMethod);
        }

        salesQuery = salesQuery.Where(x => x.Status == SaleStatus.Completed);

        var total = await salesQuery.CountAsync(cancellationToken);
        var items = await salesQuery
            .OrderByDescending(x => x.SaleDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new SaleListItemDto
            {
                Id = x.Id,
                SaleNumber = x.SaleNumber,
                ReceiptNumber = x.ReceiptNumber,
                BranchId = x.BranchId,
                BranchName = x.Branch.BranchName,
                CustomerId = x.CustomerId,
                CustomerName = x.CustomerName,
                CustomerPhone = x.CustomerPhone,
                UserId = x.UserId,
                CashierName = $"{x.User.FirstName} {x.User.LastName}",
                PaymentMethod = x.PaymentMethod,
                Subtotal = x.Subtotal,
                Discount = x.Discount,
                TotalAmount = x.TotalAmount,
                Status = x.Status,
                SaleDate = x.SaleDate
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<SaleListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<SaleDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var sale = await _context.Sales
            .AsNoTracking()
            .Include(x => x.Branch)
            .Include(x => x.User)
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Sale", id);

        return MapDetail(sale);
    }

    public async Task<SaleDetailDto> CreateAsync(
        CreateSaleRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Items.Count == 0)
        {
            throw new ValidationException("At least one sale item is required.");
        }

        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("User must be authenticated to create a sale.");

        var branch = await _unitOfWork.Branches.GetByIdAsync(request.BranchId, cancellationToken)
            ?? throw new NotFoundException("Branch", request.BranchId);

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            var saleNumber = await SequenceGenerator.NextAsync(
                _context, "sale", "SL", "SL-{year}-{sequence}", cancellationToken);
            var receiptNumber = await SequenceGenerator.NextAsync(
                _context, "receipt", "NAK", "NAK-{year}-{sequence}", cancellationToken);

            await _unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var saleItems = new List<SaleItem>();
                decimal subtotal = 0;

                foreach (var itemRequest in request.Items)
                {
                    var variant = await _context.ProductVariants
                        .Include(x => x.Product)
                        .FirstOrDefaultAsync(x => x.Id == itemRequest.ProductVariantId, cancellationToken)
                        ?? throw new NotFoundException("ProductVariant", itemRequest.ProductVariantId);

                    var totalPrice = itemRequest.UnitPrice * itemRequest.Quantity;
                    subtotal += totalPrice;

                    saleItems.Add(new SaleItem
                    {
                        ProductVariantId = variant.Id,
                        ProductName = variant.Product.ProductName,
                        VariantName = variant.VariantName,
                        Quantity = itemRequest.Quantity,
                        UnitPrice = itemRequest.UnitPrice,
                        TotalPrice = totalPrice
                    });

                    await InventoryManager.DeductStockAsync(
                        _context,
                        variant.Id,
                        itemRequest.Quantity,
                        InventoryTransactionType.Sale,
                        receiptNumber,
                        request.BranchId,
                        userId,
                        cancellationToken);
                }

                var sale = new Sale
                {
                    SaleNumber = saleNumber,
                    ReceiptNumber = receiptNumber,
                    CustomerId = request.CustomerId,
                    CustomerName = request.CustomerName,
                    CustomerPhone = request.CustomerPhone,
                    UserId = userId,
                    BranchId = branch.Id,
                    PaymentMethod = request.PaymentMethod,
                    Subtotal = subtotal,
                    Discount = request.Discount,
                    TotalAmount = subtotal - request.Discount,
                    Status = SaleStatus.Completed,
                    SaleDate = DateTime.UtcNow,
                    Items = saleItems
                };

                await _unitOfWork.Sales.AddAsync(sale, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                return await GetByIdAsync(sale.Id, cancellationToken);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        });
    }

    public async Task VoidAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var sale = await _context.Sales
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Sale", id);

        if (sale.Status != SaleStatus.Completed)
        {
            throw new ValidationException("Only completed sales can be voided.");
        }

        foreach (var item in sale.Items)
        {
            var record = await _context.InventoryRecords
                .OrderByDescending(x => x.Quantity)
                .FirstOrDefaultAsync(x => x.ProductVariantId == item.ProductVariantId, cancellationToken);

            if (record is null)
            {
                continue;
            }

            await InventoryManager.ApplyStockChangeAsync(
                _context,
                item.ProductVariantId,
                record.WarehouseId,
                record.Section,
                record.Rack,
                record.Bin,
                item.Quantity,
                InventoryTransactionType.Adjustment,
                sale.ReceiptNumber,
                "Sale void restock",
                sale.BranchId,
                _currentUserService.UserId,
                record.MinimumStockLevel,
                cancellationToken);
        }

        sale.Status = SaleStatus.Voided;
        _unitOfWork.Sales.Update(sale);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<ReceiptDataDto> GetReceiptAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var detail = await GetByIdAsync(id, cancellationToken);
        return new ReceiptDataDto
        {
            Id = detail.Id,
            SaleNumber = detail.SaleNumber,
            ReceiptNumber = detail.ReceiptNumber,
            BranchId = detail.BranchId,
            BranchName = detail.BranchName,
            CustomerId = detail.CustomerId,
            CustomerName = detail.CustomerName,
            CustomerPhone = detail.CustomerPhone,
            UserId = detail.UserId,
            CashierName = detail.CashierName,
            PaymentMethod = detail.PaymentMethod,
            Subtotal = detail.Subtotal,
            Discount = detail.Discount,
            TotalAmount = detail.TotalAmount,
            Status = detail.Status,
            SaleDate = detail.SaleDate,
            Items = detail.Items
        };
    }

    public async Task<SalesDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var completedSales = _context.Sales
            .AsNoTracking()
            .Where(x => x.Status == SaleStatus.Completed);

        var todaySales = await completedSales
            .Where(x => x.SaleDate >= today && x.SaleDate < tomorrow)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var todayTransactions = await completedSales
            .CountAsync(x => x.SaleDate >= today && x.SaleDate < tomorrow, cancellationToken);

        var weeklyRevenue = await completedSales
            .Where(x => x.SaleDate >= weekStart && x.SaleDate < tomorrow)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var monthlyRevenue = await completedSales
            .Where(x => x.SaleDate >= monthStart && x.SaleDate < tomorrow)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        return new SalesDashboardSummaryDto
        {
            TodaySales = todaySales,
            TodayTransactions = todayTransactions,
            WeeklyRevenue = weeklyRevenue,
            MonthlyRevenue = monthlyRevenue
        };
    }

    public Task<IReadOnlyList<PosProductResultDto>> SearchProductsAsync(
        string query,
        CancellationToken cancellationToken = default) =>
        _productService.GetPosCatalogAsync(query, cancellationToken);

    private static SaleDetailDto MapDetail(Sale sale) =>
        new()
        {
            Id = sale.Id,
            SaleNumber = sale.SaleNumber,
            ReceiptNumber = sale.ReceiptNumber,
            BranchId = sale.BranchId,
            BranchName = sale.Branch.BranchName,
            CustomerId = sale.CustomerId,
            CustomerName = sale.CustomerName,
            CustomerPhone = sale.CustomerPhone,
            UserId = sale.UserId,
            CashierName = $"{sale.User.FirstName} {sale.User.LastName}",
            PaymentMethod = sale.PaymentMethod,
            Subtotal = sale.Subtotal,
            Discount = sale.Discount,
            TotalAmount = sale.TotalAmount,
            Status = sale.Status,
            SaleDate = sale.SaleDate,
            Items = sale.Items.Select(item => new SaleItemDto
            {
                Id = item.Id,
                SaleId = item.SaleId,
                ProductVariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                VariantName = item.VariantName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList()
        };
}
