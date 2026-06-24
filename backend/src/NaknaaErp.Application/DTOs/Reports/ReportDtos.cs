namespace NaknaaErp.Application.DTOs.Reports;

public class ReportFiltersDto
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public Guid? BranchId { get; set; }
    public Guid? WarehouseId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Period { get; set; }
}

public class ReportMetricDto
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? HelperText { get; set; }
}

public class ReportChartPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? SecondaryValue { get; set; }
}

public class ReportsDashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalPurchases { get; set; }
    public decimal InventoryValue { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalSuppliers { get; set; }
    public int TotalServices { get; set; }
    public decimal MonthlyProfit { get; set; }
    public int MonthlyTransactions { get; set; }
    public IReadOnlyList<ReportMetricDto> Cards { get; set; } = [];
}

public class SalesReportDataDto
{
    public SalesReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<ReportChartPointDto> DailyTrend { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> MonthlyTrend { get; set; } = [];
    public IReadOnlyList<NamedQuantityRevenueDto> ByProduct { get; set; } = [];
    public IReadOnlyList<NamedQuantityRevenueDto> ByCategory { get; set; } = [];
    public IReadOnlyList<NamedQuantityRevenueDto> ByWarehouse { get; set; } = [];
    public IReadOnlyList<PaymentMethodBreakdownDto> ByPaymentMethod { get; set; } = [];
    public IReadOnlyList<CashierBreakdownDto> ByCashier { get; set; } = [];
}

public class SalesReportSummaryDto
{
    public decimal Revenue { get; set; }
    public int QuantitySold { get; set; }
    public int Transactions { get; set; }
}

public class NamedQuantityRevenueDto
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Revenue { get; set; }
}

public class PaymentMethodBreakdownDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public int Count { get; set; }
}

public class CashierBreakdownDto
{
    public string Name { get; set; } = string.Empty;
    public int Transactions { get; set; }
    public decimal Revenue { get; set; }
}

public class InventoryReportDataDto
{
    public InventoryReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<InventoryReportRowDto> CurrentInventory { get; set; } = [];
    public IReadOnlyList<StockMovementPointDto> StockMovement { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> ValuationByCategory { get; set; } = [];
    public IReadOnlyList<InventoryReportRowDto> LowStock { get; set; } = [];
    public IReadOnlyList<InventoryReportRowDto> OutOfStock { get; set; } = [];
    public IReadOnlyList<WarehouseInventoryBreakdownDto> ByWarehouse { get; set; } = [];
}

public class InventoryReportSummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalQuantity { get; set; }
    public decimal InventoryValue { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
}

public class InventoryReportRowDto
{
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal InventoryValue { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class StockMovementPointDto
{
    public string Label { get; set; } = string.Empty;
    public int StockIn { get; set; }
    public int StockOut { get; set; }
}

public class WarehouseInventoryBreakdownDto
{
    public string WarehouseName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Value { get; set; }
    public int ProductCount { get; set; }
}

public class PurchaseReportDataDto
{
    public PurchaseReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<SupplierPurchaseBreakdownDto> BySupplier { get; set; } = [];
    public IReadOnlyList<WarehousePurchaseBreakdownDto> ByWarehouse { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> Monthly { get; set; } = [];
    public IReadOnlyList<PurchaseReportRowDto> Rows { get; set; } = [];
}

public class PurchaseReportSummaryDto
{
    public int TotalPurchases { get; set; }
    public decimal TotalCost { get; set; }
    public int TotalQuantity { get; set; }
}

public class SupplierPurchaseBreakdownDto
{
    public string SupplierName { get; set; } = string.Empty;
    public int Purchases { get; set; }
    public int Quantity { get; set; }
    public decimal TotalCost { get; set; }
}

public class WarehousePurchaseBreakdownDto
{
    public string WarehouseName { get; set; } = string.Empty;
    public int Purchases { get; set; }
    public int Quantity { get; set; }
    public decimal TotalCost { get; set; }
}

public class PurchaseReportRowDto
{
    public string SupplierName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int QuantityPurchased { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime PurchaseDate { get; set; }
}

public class WarehouseReportDataDto
{
    public WarehouseReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<WarehouseReportRowDto> StockReport { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> ValueReport { get; set; } = [];
}

public class WarehouseReportSummaryDto
{
    public int TotalStock { get; set; }
    public decimal TotalValue { get; set; }
    public int TotalProducts { get; set; }
    public int TransfersThisMonth { get; set; }
}

public class WarehouseReportRowDto
{
    public string WarehouseName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public decimal InventoryValue { get; set; }
    public int ProductCount { get; set; }
}

public class CustomerReportDataDto
{
    public CustomerReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<CustomerReportRowDto> TopCustomers { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> SpendingAnalysis { get; set; } = [];
    public IReadOnlyList<CustomerReportRowDto> PurchaseHistory { get; set; } = [];
}

public class CustomerReportSummaryDto
{
    public int TotalCustomers { get; set; }
    public int ActiveCustomers { get; set; }
    public decimal AverageSpend { get; set; }
    public decimal TotalSpent { get; set; }
}

public class CustomerReportRowDto
{
    public string CustomerName { get; set; } = string.Empty;
    public int Purchases { get; set; }
    public decimal AmountSpent { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public string Frequency { get; set; } = string.Empty;
}

public class SupplierReportDataDto
{
    public SupplierReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<SupplierReportRowDto> PurchaseReport { get; set; } = [];
    public IReadOnlyList<SupplierReportRowDto> TopSuppliers { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> Performance { get; set; } = [];
}

public class SupplierReportSummaryDto
{
    public int TotalSuppliers { get; set; }
    public int ActiveSuppliers { get; set; }
    public decimal TotalPurchaseValue { get; set; }
    public int TotalQuantity { get; set; }
}

public class SupplierReportRowDto
{
    public string SupplierName { get; set; } = string.Empty;
    public int TotalPurchases { get; set; }
    public int TotalQuantitySupplied { get; set; }
    public DateTime? LastSupplyDate { get; set; }
    public decimal PerformanceScore { get; set; }
}

public class ServiceReportDataDto
{
    public ServiceReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<ReportChartPointDto> RevenueReport { get; set; } = [];
    public IReadOnlyList<ServiceReportRowDto> Rows { get; set; } = [];
}

public class ServiceReportSummaryDto
{
    public int TotalJobs { get; set; }
    public int CompletedJobs { get; set; }
    public decimal ServiceRevenue { get; set; }
    public decimal AverageJobValue { get; set; }
}

public class ServiceReportRowDto
{
    public string ServiceName { get; set; } = string.Empty;
    public int Jobs { get; set; }
    public decimal Revenue { get; set; }
}

public class UserReportDataDto
{
    public UserReportSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<UserReportRowDto> LoginReport { get; set; } = [];
    public IReadOnlyList<UserReportRowDto> SalesByUser { get; set; } = [];
    public IReadOnlyList<UserReportRowDto> InventoryActions { get; set; } = [];
}

public class UserReportSummaryDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int LoginsThisMonth { get; set; }
    public int TotalActions { get; set; }
}

public class UserReportRowDto
{
    public string UserName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Actions { get; set; }
    public DateTime? LastLogin { get; set; }
    public int SalesCount { get; set; }
    public int InventoryActions { get; set; }
}

public class ProfitLossReportDataDto
{
    public decimal TotalRevenue { get; set; }
    public decimal PurchaseCosts { get; set; }
    public decimal ServiceCosts { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal NetProfit { get; set; }
    public IReadOnlyList<ReportChartPointDto> RevenueBreakdown { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> ExpenseBreakdown { get; set; } = [];
    public IReadOnlyList<ReportChartPointDto> MonthlyTrend { get; set; } = [];
}
