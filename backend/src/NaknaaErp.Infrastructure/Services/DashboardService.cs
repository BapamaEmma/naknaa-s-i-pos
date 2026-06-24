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
        var salesQuery = _context.Sales
            .AsNoTracking()
            .Where(x => x.Status == SaleStatus.Completed);

        if (branchId.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.BranchId == branchId);
        }

        var sales = await salesQuery.ToListAsync(cancellationToken);
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var todaySales = sales.Where(x => x.SaleDate.Date == today).ToList();
        var monthSales = sales.Where(x => x.SaleDate >= monthStart).ToList();

        var inventoryRecords = await _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product)
            .ToListAsync(cancellationToken);

        var paymentTotal = monthSales.Sum(x => x.TotalAmount);
        var paymentMethods = monthSales
            .GroupBy(x => x.PaymentMethod)
            .Select(g => new PaymentMethodSliceDto
            {
                Method = g.Key,
                Label = g.Key.ToString(),
                Value = g.Sum(x => x.TotalAmount),
                Percentage = paymentTotal == 0 ? 0 : Math.Round(g.Sum(x => x.TotalAmount) / paymentTotal * 100, 2)
            })
            .ToList();

        var topProducts = await _context.SaleItems
            .AsNoTracking()
            .Include(x => x.Sale)
            .Where(x => x.Sale.Status == SaleStatus.Completed &&
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
                IsCritical = x.Quantity <= x.MinimumStockLevel / 2
            })
            .ToList();

        var recentSales = sales
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
            .ToList();

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

        return new DashboardDataDto
        {
            Kpis =
            [
                new DashboardKpiDto
                {
                    Id = "today-sales",
                    Title = "Today's Sales",
                    Value = todaySales.Sum(x => x.TotalAmount),
                    FormattedValue = todaySales.Sum(x => x.TotalAmount).ToString("N2"),
                    ChangePercent = 0,
                    Trend = "neutral",
                    Format = "currency"
                },
                new DashboardKpiDto
                {
                    Id = "monthly-revenue",
                    Title = "Monthly Revenue",
                    Value = monthSales.Sum(x => x.TotalAmount),
                    FormattedValue = monthSales.Sum(x => x.TotalAmount).ToString("N2"),
                    ChangePercent = 0,
                    Trend = "up",
                    Format = "currency"
                },
                new DashboardKpiDto
                {
                    Id = "inventory-value",
                    Title = "Inventory Value",
                    Value = inventoryRecords.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
                    FormattedValue = inventoryRecords.Sum(x => x.Quantity * x.ProductVariant.CostPrice).ToString("N2"),
                    ChangePercent = 0,
                    Trend = "neutral",
                    Format = "currency"
                }
            ],
            SalesChart = await GetSalesChartAsync(SalesChartPeriod.Daily, branchId, cancellationToken),
            PaymentMethods = paymentMethods,
            TopProducts = topProducts,
            LowStockItems = lowStock,
            RecentSales = recentSales,
            BranchPerformance = branchPerformance,
            InventoryOverview = new InventoryOverviewDto
            {
                TotalInventoryValue = inventoryRecords.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
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

        if (branchId.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.BranchId == branchId);
        }

        var now = DateTime.UtcNow;
        salesQuery = period switch
        {
            SalesChartPeriod.Daily => salesQuery.Where(x => x.SaleDate >= now.Date.AddDays(-6)),
            SalesChartPeriod.Weekly => salesQuery.Where(x => x.SaleDate >= now.Date.AddDays(-28)),
            SalesChartPeriod.Monthly => salesQuery.Where(x => x.SaleDate >= now.Date.AddMonths(-11)),
            _ => salesQuery
        };

        var sales = await salesQuery.ToListAsync(cancellationToken);

        return period switch
        {
            SalesChartPeriod.Daily => Enumerable.Range(0, 7)
                .Select(offset =>
                {
                    var day = now.Date.AddDays(-6 + offset);
                    var daySales = sales.Where(x => x.SaleDate.Date == day).ToList();
                    return new SalesChartPointDto
                    {
                        Label = day.ToString("ddd"),
                        Sales = daySales.Sum(x => x.TotalAmount),
                        Transactions = daySales.Count
                    };
                }).ToList(),
            SalesChartPeriod.Weekly => Enumerable.Range(0, 4)
                .Select(week =>
                {
                    var weekStart = now.Date.AddDays(-28 + week * 7);
                    var weekEnd = weekStart.AddDays(7);
                    var weekSales = sales.Where(x => x.SaleDate >= weekStart && x.SaleDate < weekEnd).ToList();
                    return new SalesChartPointDto
                    {
                        Label = $"Week {week + 1}",
                        Sales = weekSales.Sum(x => x.TotalAmount),
                        Transactions = weekSales.Count
                    };
                }).ToList(),
            SalesChartPeriod.Monthly => Enumerable.Range(0, 12)
                .Select(monthOffset =>
                {
                    var month = new DateTime(now.Year, now.Month, 1).AddMonths(-11 + monthOffset);
                    var monthSales = sales.Where(x => x.SaleDate.Year == month.Year && x.SaleDate.Month == month.Month).ToList();
                    return new SalesChartPointDto
                    {
                        Label = month.ToString("MMM"),
                        Sales = monthSales.Sum(x => x.TotalAmount),
                        Transactions = monthSales.Count
                    };
                }).ToList(),
            _ => []
        };
    }
}
