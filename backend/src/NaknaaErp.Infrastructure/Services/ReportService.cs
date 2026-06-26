using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.Reports;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReportsDashboardSummaryDto> GetDashboardSummaryAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var sales = await FilterSalesAsync(filters, cancellationToken);
        var purchases = await FilterPurchasesAsync(filters, cancellationToken);
        var inventory = await _context.InventoryRecords.AsNoTracking().Include(x => x.ProductVariant).ToListAsync(cancellationToken);

        return new ReportsDashboardSummaryDto
        {
            TotalRevenue = sales.Sum(x => x.TotalAmount),
            TotalPurchases = purchases.Sum(x => x.TotalAmount),
            InventoryValue = inventory.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
            TotalCustomers = await _context.Customers.CountAsync(cancellationToken),
            TotalSuppliers = await _context.Suppliers.CountAsync(cancellationToken),
            TotalServices = await _context.Services.CountAsync(cancellationToken),
            MonthlyProfit = sales.Sum(x => x.TotalAmount) - purchases.Sum(x => x.TotalAmount),
            MonthlyTransactions = sales.Count,
            Cards =
            [
                new ReportMetricDto { Label = "Revenue", Value = sales.Sum(x => x.TotalAmount).ToString("N2") },
                new ReportMetricDto { Label = "Purchases", Value = purchases.Sum(x => x.TotalAmount).ToString("N2") },
                new ReportMetricDto { Label = "Inventory Value", Value = inventory.Sum(x => x.Quantity * x.ProductVariant.CostPrice).ToString("N2") }
            ]
        };
    }

    public async Task<SalesReportDataDto> GetSalesReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var sales = await FilterSalesAsync(filters, cancellationToken);
        var saleIds = sales.Select(x => x.Id).ToList();
        var items = await _context.SaleItems
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product).ThenInclude(x => x.Category)
            .Where(x => saleIds.Contains(x.SaleId))
            .ToListAsync(cancellationToken);

        return new SalesReportDataDto
        {
            Summary = new SalesReportSummaryDto
            {
                Revenue = sales.Sum(x => x.TotalAmount),
                QuantitySold = items.Sum(x => x.Quantity),
                Transactions = sales.Count
            },
            DailyTrend = sales.GroupBy(x => x.SaleDate.Date)
                .Select(g => new ReportChartPointDto { Label = g.Key.ToString("yyyy-MM-dd"), Value = g.Sum(x => x.TotalAmount), SecondaryValue = g.Count() })
                .OrderBy(x => x.Label)
                .ToList(),
            MonthlyTrend = sales.GroupBy(x => x.SaleDate.ToString("yyyy-MM"))
                .Select(g => new ReportChartPointDto { Label = g.Key, Value = g.Sum(x => x.TotalAmount), SecondaryValue = g.Count() })
                .OrderBy(x => x.Label)
                .ToList(),
            ByProduct = items.GroupBy(x => x.ProductName)
                .Select(g => new NamedQuantityRevenueDto { Name = g.Key, Quantity = g.Sum(x => x.Quantity), Revenue = g.Sum(x => x.TotalPrice) })
                .OrderByDescending(x => x.Revenue)
                .ToList(),
            ByCategory = items.GroupBy(x => x.ProductVariant.Product.Category.Name)
                .Select(g => new NamedQuantityRevenueDto { Name = g.Key, Quantity = g.Sum(x => x.Quantity), Revenue = g.Sum(x => x.TotalPrice) })
                .ToList(),
            ByWarehouse = [],
            ByPaymentMethod = sales.GroupBy(x => x.PaymentMethod)
                .Select(g => new PaymentMethodBreakdownDto { Name = g.Key.ToString(), Value = g.Sum(x => x.TotalAmount), Count = g.Count() })
                .ToList(),
            ByCashier = sales.GroupBy(x => x.UserId)
                .Select(g => new CashierBreakdownDto
                {
                    Name = g.First().User?.FirstName + " " + g.First().User?.LastName,
                    Transactions = g.Count(),
                    Revenue = g.Sum(x => x.TotalAmount)
                })
                .ToList()
        };
    }

    public async Task<InventoryReportDataDto> GetInventoryReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var recordsQuery = _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product).ThenInclude(x => x.Category)
            .Include(x => x.Warehouse)
            .AsQueryable();

        if (filters.WarehouseId.HasValue)
        {
            recordsQuery = recordsQuery.Where(x => x.WarehouseId == filters.WarehouseId);
        }

        if (filters.CategoryId.HasValue)
        {
            recordsQuery = recordsQuery.Where(x => x.ProductVariant.Product.CategoryId == filters.CategoryId);
        }

        var records = await recordsQuery.ToListAsync(cancellationToken);
        var rows = records.Select(x => new InventoryReportRowDto
        {
            ProductName = x.ProductVariant.Product.ProductName,
            CategoryName = x.ProductVariant.Product.Category.Name,
            Quantity = x.Quantity,
            WarehouseName = x.Warehouse.WarehouseName,
            InventoryValue = x.Quantity * x.ProductVariant.CostPrice,
            Status = InventoryManager.GetStockStatus(x.Quantity, x.MinimumStockLevel)
        }).ToList();

        var transactions = await _context.InventoryTransactions.AsNoTracking().ToListAsync(cancellationToken);

        return new InventoryReportDataDto
        {
            Summary = new InventoryReportSummaryDto
            {
                TotalProducts = records.Select(x => x.ProductVariantId).Distinct().Count(),
                TotalQuantity = records.Sum(x => x.Quantity),
                InventoryValue = records.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
                LowStockCount = records.Count(x => x.Quantity > 0 && x.Quantity <= x.MinimumStockLevel),
                OutOfStockCount = records.Count(x => x.Quantity <= 0)
            },
            CurrentInventory = rows,
            StockMovement = transactions.GroupBy(x => x.CreatedAt.Date)
                .Select(g => new StockMovementPointDto
                {
                    Label = g.Key.ToString("yyyy-MM-dd"),
                    StockIn = g.Where(x => x.TransactionType is InventoryTransactionType.StockIn or InventoryTransactionType.PurchaseReceive).Sum(x => x.Quantity),
                    StockOut = g.Where(x => x.TransactionType is InventoryTransactionType.StockOut or InventoryTransactionType.Sale).Sum(x => x.Quantity)
                })
                .OrderBy(x => x.Label)
                .ToList(),
            ValuationByCategory = records.GroupBy(x => x.ProductVariant.Product.Category.Name)
                .Select(g => new ReportChartPointDto { Label = g.Key, Value = g.Sum(x => x.Quantity * x.ProductVariant.CostPrice) })
                .ToList(),
            LowStock = rows.Where(x => x.Status == "low_stock").ToList(),
            OutOfStock = rows.Where(x => x.Status == "out_of_stock").ToList(),
            ByWarehouse = records.GroupBy(x => x.Warehouse.WarehouseName)
                .Select(g => new WarehouseInventoryBreakdownDto
                {
                    WarehouseName = g.Key,
                    Quantity = g.Sum(x => x.Quantity),
                    Value = g.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
                    ProductCount = g.Select(x => x.ProductVariantId).Distinct().Count()
                })
                .ToList()
        };
    }

    public async Task<PurchaseReportDataDto> GetPurchaseReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var purchases = await FilterPurchasesAsync(filters, cancellationToken);
        var purchaseIds = purchases.Select(x => x.Id).ToList();
        var items = await _context.PurchaseItems
            .AsNoTracking()
            .Include(x => x.ProductVariant).ThenInclude(x => x.Product)
            .Include(x => x.Purchase).ThenInclude(x => x.Supplier)
            .Where(x => purchaseIds.Contains(x.PurchaseId))
            .ToListAsync(cancellationToken);

        return new PurchaseReportDataDto
        {
            Summary = new PurchaseReportSummaryDto
            {
                TotalPurchases = purchases.Count,
                TotalCost = purchases.Sum(x => x.TotalAmount),
                TotalQuantity = items.Sum(x => x.Quantity)
            },
            BySupplier = purchases.GroupBy(x => x.Supplier.SupplierName)
                .Select(g => new SupplierPurchaseBreakdownDto
                {
                    SupplierName = g.Key,
                    Purchases = g.Count(),
                    Quantity = items.Where(i => g.Select(p => p.Id).Contains(i.PurchaseId)).Sum(i => i.Quantity),
                    TotalCost = g.Sum(x => x.TotalAmount)
                }).ToList(),
            ByWarehouse = purchases.GroupBy(x => x.Warehouse.WarehouseName)
                .Select(g => new WarehousePurchaseBreakdownDto
                {
                    WarehouseName = g.Key,
                    Purchases = g.Count(),
                    Quantity = items.Where(i => g.Select(p => p.Id).Contains(i.PurchaseId)).Sum(i => i.Quantity),
                    TotalCost = g.Sum(x => x.TotalAmount)
                }).ToList(),
            Monthly = purchases.GroupBy(x => x.PurchaseDate.ToString("yyyy-MM"))
                .Select(g => new ReportChartPointDto { Label = g.Key, Value = g.Sum(x => x.TotalAmount), SecondaryValue = g.Count() })
                .OrderBy(x => x.Label)
                .ToList(),
            Rows = items.Select(x => new PurchaseReportRowDto
            {
                SupplierName = x.Purchase.Supplier.SupplierName,
                ProductName = x.ProductVariant.Product.ProductName,
                QuantityPurchased = x.Quantity,
                TotalCost = x.TotalCost,
                PurchaseDate = x.Purchase.PurchaseDate
            }).ToList()
        };
    }

    public async Task<WarehouseReportDataDto> GetWarehouseReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var recordsQuery = _context.InventoryRecords
            .AsNoTracking()
            .Include(x => x.ProductVariant)
            .Include(x => x.Warehouse)
            .AsQueryable();

        if (filters.WarehouseId.HasValue)
        {
            recordsQuery = recordsQuery.Where(x => x.WarehouseId == filters.WarehouseId);
        }

        var records = await recordsQuery.ToListAsync(cancellationToken);
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        return new WarehouseReportDataDto
        {
            Summary = new WarehouseReportSummaryDto
            {
                TotalStock = records.Sum(x => x.Quantity),
                TotalValue = records.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
                TotalProducts = records.Select(x => x.ProductVariantId).Distinct().Count(),
                TransfersThisMonth = await _context.InventoryTransactions.CountAsync(
                    x => x.TransactionType == InventoryTransactionType.Transfer && x.CreatedAt >= monthStart,
                    cancellationToken)
            },
            StockReport = records.GroupBy(x => x.Warehouse.WarehouseName)
                .Select(g => new WarehouseReportRowDto
                {
                    WarehouseName = g.Key,
                    StockQuantity = g.Sum(x => x.Quantity),
                    InventoryValue = g.Sum(x => x.Quantity * x.ProductVariant.CostPrice),
                    ProductCount = g.Select(x => x.ProductVariantId).Distinct().Count()
                }).ToList(),
            ValueReport = records.GroupBy(x => x.Warehouse.WarehouseName)
                .Select(g => new ReportChartPointDto { Label = g.Key, Value = g.Sum(x => x.Quantity * x.ProductVariant.CostPrice) })
                .ToList()
        };
    }

    public async Task<CustomerReportDataDto> GetCustomerReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var sales = await FilterSalesAsync(filters, cancellationToken);
        var customers = await _context.Customers.AsNoTracking().ToListAsync(cancellationToken);

        var rows = customers.Select(c =>
        {
            var customerSales = sales.Where(x => x.CustomerId == c.Id).ToList();
            return new CustomerReportRowDto
            {
                CustomerName = c.CustomerName,
                Purchases = customerSales.Count,
                AmountSpent = customerSales.Sum(x => x.TotalAmount),
                LastPurchaseDate = customerSales.OrderByDescending(x => x.SaleDate).FirstOrDefault()?.SaleDate,
                Frequency = customerSales.Count switch
                {
                    0 => "None",
                    <= 2 => "Low",
                    <= 5 => "Medium",
                    _ => "High"
                }
            };
        }).OrderByDescending(x => x.AmountSpent).ToList();

        return new CustomerReportDataDto
        {
            Summary = new CustomerReportSummaryDto
            {
                TotalCustomers = customers.Count,
                ActiveCustomers = rows.Count(x => x.Purchases > 0),
                AverageSpend = rows.Where(x => x.Purchases > 0).DefaultIfEmpty().Average(x => x?.AmountSpent ?? 0),
                TotalSpent = rows.Sum(x => x.AmountSpent)
            },
            TopCustomers = rows.Take(10).ToList(),
            SpendingAnalysis = rows.Where(x => x.AmountSpent > 0)
                .Select(x => new ReportChartPointDto { Label = x.CustomerName, Value = x.AmountSpent })
                .Take(10)
                .ToList(),
            PurchaseHistory = rows.Where(x => x.Purchases > 0).Take(20).ToList()
        };
    }

    public async Task<SupplierReportDataDto> GetSupplierReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var purchases = await FilterPurchasesAsync(filters, cancellationToken);
        var suppliers = await _context.Suppliers.AsNoTracking().ToListAsync(cancellationToken);

        var rows = suppliers.Select(s =>
        {
            var supplierPurchases = purchases.Where(x => x.SupplierId == s.Id).ToList();
            return new SupplierReportRowDto
            {
                SupplierName = s.SupplierName,
                TotalPurchases = supplierPurchases.Count,
                TotalQuantitySupplied = supplierPurchases.SelectMany(x => x.Items).Sum(x => x.ReceivedQuantity),
                LastSupplyDate = supplierPurchases.OrderByDescending(x => x.PurchaseDate).FirstOrDefault()?.PurchaseDate,
                PerformanceScore = supplierPurchases.Count == 0 ? 0 : Math.Min(100, supplierPurchases.Count * 10m)
            };
        }).OrderByDescending(x => x.TotalPurchases).ToList();

        return new SupplierReportDataDto
        {
            Summary = new SupplierReportSummaryDto
            {
                TotalSuppliers = suppliers.Count,
                ActiveSuppliers = suppliers.Count(x => x.IsActive),
                TotalPurchaseValue = purchases.Sum(x => x.TotalAmount),
                TotalQuantity = purchases.SelectMany(x => x.Items).Sum(x => x.Quantity)
            },
            PurchaseReport = rows,
            TopSuppliers = rows.Take(10).ToList(),
            Performance = rows.Take(10)
                .Select(x => new ReportChartPointDto { Label = x.SupplierName, Value = x.PerformanceScore })
                .ToList()
        };
    }

    public async Task<ServiceReportDataDto> GetServiceReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var jobsQuery = _context.ServiceJobs.AsNoTracking().Include(x => x.Service).AsQueryable();

        if (filters.DateFrom.HasValue)
        {
            jobsQuery = jobsQuery.Where(x => x.CreatedAt >= filters.DateFrom);
        }

        if (filters.DateTo.HasValue)
        {
            jobsQuery = jobsQuery.Where(x => x.CreatedAt <= filters.DateTo);
        }

        var jobs = await jobsQuery.ToListAsync(cancellationToken);

        return new ServiceReportDataDto
        {
            Summary = new ServiceReportSummaryDto
            {
                TotalJobs = jobs.Count,
                CompletedJobs = jobs.Count(x => x.Status == ServiceJobStatus.Completed),
                ServiceRevenue = jobs.Where(x => x.Status == ServiceJobStatus.Completed).Sum(x => x.Price),
                AverageJobValue = jobs.Count == 0 ? 0 : jobs.Average(x => x.Price)
            },
            RevenueReport = jobs.GroupBy(x => x.CreatedAt.ToString("yyyy-MM"))
                .Select(g => new ReportChartPointDto { Label = g.Key, Value = g.Where(x => x.Status == ServiceJobStatus.Completed).Sum(x => x.Price) })
                .OrderBy(x => x.Label)
                .ToList(),
            Rows = jobs.GroupBy(x => x.Service.ServiceName)
                .Select(g => new ServiceReportRowDto
                {
                    ServiceName = g.Key,
                    Jobs = g.Count(),
                    Revenue = g.Where(x => x.Status == ServiceJobStatus.Completed).Sum(x => x.Price)
                }).ToList()
        };
    }

    public async Task<UserReportDataDto> GetUserReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.AsNoTracking().Include(x => x.Role).ToListAsync(cancellationToken);
        var sales = await FilterSalesAsync(filters, cancellationToken);
        var auditLogs = await _context.AuditLogs.AsNoTracking().ToListAsync(cancellationToken);

        return new UserReportDataDto
        {
            Summary = new UserReportSummaryDto
            {
                TotalUsers = users.Count,
                ActiveUsers = users.Count(x => x.IsActive),
                LoginsThisMonth = auditLogs.Count(x => x.Action.Contains("Login", StringComparison.OrdinalIgnoreCase)),
                TotalActions = auditLogs.Count
            },
            LoginReport = users.Select(u => new UserReportRowDto
            {
                UserName = $"{u.FirstName} {u.LastName}",
                Role = u.Role.Name,
                Actions = auditLogs.Count(x => x.UserId == u.Id),
                LastLogin = auditLogs.Where(x => x.UserId == u.Id).OrderByDescending(x => x.ActionDate).FirstOrDefault()?.ActionDate
            }).ToList(),
            SalesByUser = users.Select(u => new UserReportRowDto
            {
                UserName = $"{u.FirstName} {u.LastName}",
                Role = u.Role.Name,
                SalesCount = sales.Count(x => x.UserId == u.Id),
                Actions = sales.Where(x => x.UserId == u.Id).Sum(x => x.TotalAmount) > 0 ? sales.Count(x => x.UserId == u.Id) : 0
            }).ToList(),
            InventoryActions = users.Select(u => new UserReportRowDto
            {
                UserName = $"{u.FirstName} {u.LastName}",
                Role = u.Role.Name,
                InventoryActions = auditLogs.Count(x => x.UserId == u.Id && x.Entity.Contains("Inventory", StringComparison.OrdinalIgnoreCase))
            }).ToList()
        };
    }

    public async Task<ProfitLossReportDataDto> GetProfitLossReportAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken = default)
    {
        var sales = await FilterSalesAsync(filters, cancellationToken);
        var purchases = await FilterPurchasesAsync(filters, cancellationToken);
        var serviceRevenue = await _context.ServiceJobs
            .Where(x => x.Status == ServiceJobStatus.Completed)
            .SumAsync(x => x.Price, cancellationToken);

        var revenue = sales.Sum(x => x.TotalAmount) + serviceRevenue;
        var purchaseCosts = purchases.Sum(x => x.TotalAmount);

        return new ProfitLossReportDataDto
        {
            TotalRevenue = revenue,
            PurchaseCosts = purchaseCosts,
            ServiceCosts = 0,
            TotalExpenses = purchaseCosts,
            GrossProfit = revenue - purchaseCosts,
            NetProfit = revenue - purchaseCosts,
            RevenueBreakdown =
            [
                new ReportChartPointDto { Label = "Sales", Value = sales.Sum(x => x.TotalAmount) },
                new ReportChartPointDto { Label = "Services", Value = serviceRevenue }
            ],
            ExpenseBreakdown =
            [
                new ReportChartPointDto { Label = "Purchases", Value = purchaseCosts }
            ],
            MonthlyTrend = sales.GroupBy(x => x.SaleDate.ToString("yyyy-MM"))
                .Select(g => new ReportChartPointDto { Label = g.Key, Value = g.Sum(x => x.TotalAmount) })
                .OrderBy(x => x.Label)
                .ToList()
        };
    }

    private async Task<List<Domain.Entities.Sale>> FilterSalesAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var query = _context.Sales
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.Status == SaleStatus.Completed);

        if (filters.BranchId.HasValue)
        {
            query = query.Where(x => x.BranchId == filters.BranchId);
        }

        if (filters.UserId.HasValue)
        {
            query = query.Where(x => x.UserId == filters.UserId);
        }

        if (filters.DateFrom.HasValue)
        {
            query = query.Where(x => x.SaleDate >= filters.DateFrom);
        }

        if (filters.DateTo.HasValue)
        {
            query = query.Where(x => x.SaleDate <= filters.DateTo);
        }

        return await query.ToListAsync(cancellationToken);
    }

    private async Task<List<Domain.Entities.Purchase>> FilterPurchasesAsync(
        ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var query = _context.Purchases
            .AsNoTracking()
            .Include(x => x.Supplier)
            .Include(x => x.Warehouse)
            .Include(x => x.Items)
            .Where(x => x.Status != PurchaseStatus.Cancelled);

        if (filters.WarehouseId.HasValue)
        {
            query = query.Where(x => x.WarehouseId == filters.WarehouseId);
        }

        if (filters.DateFrom.HasValue)
        {
            query = query.Where(x => x.PurchaseDate >= filters.DateFrom);
        }

        if (filters.DateTo.HasValue)
        {
            query = query.Where(x => x.PurchaseDate <= filters.DateTo);
        }

        return await query.ToListAsync(cancellationToken);
    }
}
