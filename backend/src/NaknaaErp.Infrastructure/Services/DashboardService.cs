using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.Dashboard;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalSales = await _context.Sales
            .AsNoTracking()
            .Where(x => x.Status == SaleStatus.Completed)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var totalProducts = await _context.Products.AsNoTracking().CountAsync(cancellationToken);
        var totalCustomers = await _context.Customers.AsNoTracking().CountAsync(cancellationToken);
        var totalSuppliers = await _context.Suppliers.AsNoTracking().CountAsync(cancellationToken);
        var totalWarehouses = await _context.Warehouses.AsNoTracking().CountAsync(cancellationToken);

        var inventoryRecords = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant)
            .ToListAsync(cancellationToken);

        var lowStockItems = inventoryRecords.Count(x =>
            x.Quantity > 0 && x.Quantity <= Math.Max(x.MinimumStockLevel, x.ProductVariant.ReorderLevel));

        return new DashboardSummaryDto
        {
            TotalSales = totalSales,
            TotalProducts = totalProducts,
            TotalCustomers = totalCustomers,
            TotalSuppliers = totalSuppliers,
            TotalWarehouses = totalWarehouses,
            LowStockItems = lowStockItems
        };
    }

    public async Task<DashboardDataDto> GetDashboardDataAsync(
        Guid? branchId = null,
        CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var yesterday = today.AddDays(-1);
        var dayAfterYesterday = today;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = monthStart.AddMonths(-1);

        IQueryable<Domain.Entities.Sale> completedSalesQuery = _context.Sales
            .AsNoTracking()
            .Where(x => x.Status == SaleStatus.Completed);

        if (branchId.HasValue)
        {
            completedSalesQuery = completedSalesQuery.Where(x => x.BranchId == branchId);
        }

        var todaySalesTotal = await completedSalesQuery
            .Where(x => x.SaleDate >= today && x.SaleDate < tomorrow)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var todayTransactions = await completedSalesQuery
            .CountAsync(x => x.SaleDate >= today && x.SaleDate < tomorrow, cancellationToken);

        var yesterdaySalesTotal = await completedSalesQuery
            .Where(x => x.SaleDate >= yesterday && x.SaleDate < dayAfterYesterday)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var yesterdayTransactions = await completedSalesQuery
            .CountAsync(x => x.SaleDate >= yesterday && x.SaleDate < dayAfterYesterday, cancellationToken);

        var monthSalesTotal = await completedSalesQuery
            .Where(x => x.SaleDate >= monthStart && x.SaleDate < tomorrow)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var lastMonthSalesTotal = await completedSalesQuery
            .Where(x => x.SaleDate >= lastMonthStart && x.SaleDate < monthStart)
            .SumAsync(x => x.TotalAmount, cancellationToken);

        var inventoryRecords = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product)
            .ToListAsync(cancellationToken);

        var paymentTotal = monthSalesTotal;
        var paymentMethods = monthSalesTotal == 0
            ? []
            : await completedSalesQuery
                .Where(x => x.SaleDate >= monthStart && x.SaleDate < tomorrow)
                .GroupBy(x => x.PaymentMethod)
                .Select(g => new PaymentMethodSliceDto
                {
                    Method = g.Key,
                    Label = g.Key == PaymentMethod.MobileMoney ? "Mobile Money" : "Cash",
                    Value = g.Sum(x => x.TotalAmount),
                    Percentage = paymentTotal == 0 ? 0 : Math.Round(g.Sum(x => x.TotalAmount) / paymentTotal * 100, 2)
                })
                .OrderByDescending(x => x.Value)
                .ToListAsync(cancellationToken);

        var topCategories = await BuildTopCategoriesAsync(monthStart, branchId, cancellationToken);

        var topProducts = monthSalesTotal == 0
            ? []
            : await _context.SaleItems
                .AsNoTracking()
                .Include(x => x.Sale)
                .Where(x => x.Sale.Status == SaleStatus.Completed &&
                            x.Sale.SaleDate >= monthStart &&
                            x.Sale.SaleDate < tomorrow &&
                            (!branchId.HasValue || x.Sale.BranchId == branchId))
                .GroupBy(x => new { x.ProductName, x.VariantName })
                .Select(g => new TopSellingProductDto
                {
                    Id = Guid.NewGuid(),
                    ProductName = g.Key.ProductName,
                    VariantName = g.Key.VariantName,
                    UnitsSold = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.TotalPrice)
                })
                .OrderByDescending(x => x.Revenue)
                .Take(5)
                .ToListAsync(cancellationToken);

        var lowStock = inventoryRecords
            .Where(x => x.Quantity > 0 && x.Quantity <= x.MinimumStockLevel)
            .Take(5)
            .Select(x => new DashboardLowStockItemDto
            {
                Id = x.Id,
                ProductName = x.ProductVariant.Product.ProductName,
                VariantName = x.ProductVariant.VariantName,
                CurrentStock = x.Quantity,
                MinimumStock = x.MinimumStockLevel,
                IsCritical = x.Quantity <= Math.Max(1, x.MinimumStockLevel / 2)
            })
            .ToList();

        var recentSales = await completedSalesQuery
            .OrderByDescending(x => x.SaleDate)
            .Take(5)
            .Select(x => new DashboardRecentSaleDto
            {
                Id = x.Id,
                ReceiptNumber = x.ReceiptNumber,
                CustomerName = x.CustomerName ?? "Walk-in Customer",
                Amount = x.TotalAmount,
                PaymentMethod = x.PaymentMethod,
                SaleDate = x.SaleDate
            })
            .ToListAsync(cancellationToken);

        var branchPerformance = await _context.Branches
            .AsNoTracking()
            .Select(b => new BranchPerformanceDto
            {
                BranchId = b.Id,
                BranchName = b.BranchName,
                SalesAmount = _context.Sales
                    .Where(s => s.BranchId == b.Id && s.Status == SaleStatus.Completed)
                    .Sum(s => s.TotalAmount),
                Transactions = _context.Sales
                    .Count(s => s.BranchId == b.Id && s.Status == SaleStatus.Completed)
            })
            .ToListAsync(cancellationToken);

        var inventoryValue = inventoryRecords.Sum(x =>
            x.Quantity * (x.ProductVariant.SellingPrice > 0
                ? x.ProductVariant.SellingPrice
                : x.ProductVariant.Product.SellingPrice));

        return new DashboardDataDto
        {
            Kpis =
            [
                BuildKpi(
                    "today-sales",
                    "Today's Sales",
                    todaySalesTotal,
                    CalculateChangePercent(todaySalesTotal, yesterdaySalesTotal),
                    "currency"),
                BuildKpi(
                    "monthly-revenue",
                    "Monthly Revenue",
                    monthSalesTotal,
                    CalculateChangePercent(monthSalesTotal, lastMonthSalesTotal),
                    "currency"),
                BuildKpi(
                    "today-transactions",
                    "Today's Transactions",
                    todayTransactions,
                    CalculateChangePercent(todayTransactions, yesterdayTransactions),
                    "number"),
                BuildKpi(
                    "inventory-value",
                    "Inventory Value",
                    inventoryValue,
                    0,
                    "currency")
            ],
            SalesChart = await GetSalesChartAsync(SalesChartPeriod.Daily, branchId, cancellationToken),
            PaymentMethods = paymentMethods,
            TopCategories = topCategories,
            TopProducts = topProducts,
            LowStockItems = lowStock,
            RecentSales = recentSales,
            BranchPerformance = branchPerformance,
            InventoryOverview = new InventoryOverviewDto
            {
                TotalInventoryValue = inventoryValue,
                TotalStockQuantity = inventoryRecords.Sum(x => x.Quantity),
                LowStockCount = inventoryRecords.Count(x => x.Quantity > 0 && x.Quantity <= x.MinimumStockLevel),
                OutOfStockCount = inventoryRecords.Count(x => x.Quantity <= 0)
            },
            Notifications = lowStock.Select(x => new DashboardNotificationDto
            {
                Id = x.Id,
                Type = "low_stock",
                Title = "Low Stock Alert",
                Message = $"{x.ProductName} ({x.VariantName}) is running low.",
                Timestamp = DateTime.UtcNow
            }).ToList()
        };
    }

    public async Task<IReadOnlyList<SalesChartPointDto>> GetSalesChartAsync(
        SalesChartPeriod period,
        Guid? branchId = null,
        CancellationToken cancellationToken = default)
    {
        var salesQuery = _context.Sales
            .AsNoTracking()
            .Where(x => x.Status == SaleStatus.Completed);

        var purchasesQuery = _context.Purchases
            .AsNoTracking()
            .Where(x => x.Status == PurchaseStatus.Received);

        if (branchId.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.BranchId == branchId);
        }

        var now = DateTime.UtcNow;
        var rangeStart = period switch
        {
            SalesChartPeriod.Daily => now.Date.AddDays(-6),
            SalesChartPeriod.Weekly => now.Date.AddDays(-28),
            SalesChartPeriod.Monthly => now.Date.AddMonths(-5),
            _ => now.Date.AddDays(-6)
        };

        salesQuery = salesQuery.Where(x => x.SaleDate >= rangeStart);
        purchasesQuery = purchasesQuery.Where(x => x.PurchaseDate >= rangeStart);

        var sales = await salesQuery.ToListAsync(cancellationToken);
        var purchases = await purchasesQuery.ToListAsync(cancellationToken);

        return period switch
        {
            SalesChartPeriod.Daily => Enumerable.Range(0, 7)
                .Select(offset =>
                {
                    var dayStart = now.Date.AddDays(-6 + offset);
                    var dayEnd = dayStart.AddDays(1);
                    var daySales = sales.Where(x => x.SaleDate >= dayStart && x.SaleDate < dayEnd).ToList();
                    var dayPurchases = purchases.Where(x => x.PurchaseDate >= dayStart && x.PurchaseDate < dayEnd).ToList();
                    return new SalesChartPointDto
                    {
                        Label = dayStart.ToString("ddd"),
                        Sales = daySales.Sum(x => x.TotalAmount),
                        Purchases = dayPurchases.Sum(x => x.TotalAmount),
                        Transactions = daySales.Count
                    };
                }).ToList(),
            SalesChartPeriod.Weekly => Enumerable.Range(0, 4)
                .Select(week =>
                {
                    var weekStart = now.Date.AddDays(-28 + week * 7);
                    var weekEnd = weekStart.AddDays(7);
                    var weekSales = sales.Where(x => x.SaleDate >= weekStart && x.SaleDate < weekEnd).ToList();
                    var weekPurchases = purchases.Where(x => x.PurchaseDate >= weekStart && x.PurchaseDate < weekEnd).ToList();
                    return new SalesChartPointDto
                    {
                        Label = $"Week {week + 1}",
                        Sales = weekSales.Sum(x => x.TotalAmount),
                        Purchases = weekPurchases.Sum(x => x.TotalAmount),
                        Transactions = weekSales.Count
                    };
                }).ToList(),
            SalesChartPeriod.Monthly => Enumerable.Range(0, 6)
                .Select(monthOffset =>
                {
                    var month = new DateTime(now.Year, now.Month, 1).AddMonths(-5 + monthOffset);
                    var monthSales = sales.Where(x => x.SaleDate.Year == month.Year && x.SaleDate.Month == month.Month).ToList();
                    var monthPurchases = purchases.Where(x => x.PurchaseDate.Year == month.Year && x.PurchaseDate.Month == month.Month).ToList();
                    return new SalesChartPointDto
                    {
                        Label = month.ToString("MMM"),
                        Sales = monthSales.Sum(x => x.TotalAmount),
                        Purchases = monthPurchases.Sum(x => x.TotalAmount),
                        Transactions = monthSales.Count
                    };
                }).ToList(),
            _ => []
        };
    }

    private async Task<IReadOnlyList<CategorySalesSliceDto>> BuildTopCategoriesAsync(
        DateTime monthStart,
        Guid? branchId,
        CancellationToken cancellationToken)
    {
        var saleItems = await _context.SaleItems
            .AsNoTracking()
            .Include(x => x.Sale)
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product).ThenInclude(x => x.Category)
            .Where(x => x.Sale.Status == SaleStatus.Completed &&
                        x.Sale.SaleDate >= monthStart &&
                        x.Sale.SaleDate < DateTime.UtcNow.Date.AddDays(1) &&
                        (!branchId.HasValue || x.Sale.BranchId == branchId))
            .ToListAsync(cancellationToken);

        var total = saleItems.Sum(x => x.TotalPrice);
        if (total == 0)
        {
            return [];
        }

        return saleItems
            .GroupBy(x => new { x.ProductVariant.Product.CategoryId, x.ProductVariant.Product.Category.Name })
            .Select(g => new CategorySalesSliceDto
            {
                CategoryId = g.Key.CategoryId,
                Label = g.Key.Name,
                Value = g.Sum(x => x.TotalPrice),
                Percentage = Math.Round(g.Sum(x => x.TotalPrice) / total * 100, 2)
            })
            .OrderByDescending(x => x.Value)
            .Take(6)
            .ToList();
    }

    private static DashboardKpiDto BuildKpi(
        string id,
        string title,
        decimal value,
        decimal changePercent,
        string format)
    {
        var trend = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "neutral";
        var formattedValue = format == "currency"
            ? value.ToString("C2", System.Globalization.CultureInfo.GetCultureInfo("en-GH"))
            : value.ToString("N0");

        return new DashboardKpiDto
        {
            Id = id,
            Title = title,
            Value = value,
            FormattedValue = formattedValue,
            ChangePercent = changePercent,
            Trend = trend,
            Format = format
        };
    }

    private static decimal CalculateChangePercent(decimal current, decimal previous)
    {
        if (current == 0 && previous == 0)
        {
            return 0;
        }

        if (previous == 0)
        {
            return 0;
        }

        return Math.Round((current - previous) / previous * 100, 1);
    }

    private static string FormatPaymentMethod(PaymentMethod method) =>
        method switch
        {
            PaymentMethod.MobileMoney => "Mobile Money",
            _ => "Cash"
        };
}
