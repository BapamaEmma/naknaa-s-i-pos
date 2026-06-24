using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.Dashboard;

public class DashboardDataDto
{
    public IReadOnlyList<DashboardKpiDto> Kpis { get; set; } = [];
    public IReadOnlyList<SalesChartPointDto> SalesChart { get; set; } = [];
    public IReadOnlyList<PaymentMethodSliceDto> PaymentMethods { get; set; } = [];
    public IReadOnlyList<CategorySalesSliceDto> TopCategories { get; set; } = [];
    public IReadOnlyList<TopSellingProductDto> TopProducts { get; set; } = [];
    public IReadOnlyList<DashboardLowStockItemDto> LowStockItems { get; set; } = [];
    public IReadOnlyList<DashboardRecentSaleDto> RecentSales { get; set; } = [];
    public IReadOnlyList<BranchPerformanceDto> BranchPerformance { get; set; } = [];
    public InventoryOverviewDto InventoryOverview { get; set; } = new();
    public IReadOnlyList<DashboardNotificationDto> Notifications { get; set; } = [];
}

public class DashboardKpiDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string FormattedValue { get; set; } = string.Empty;
    public decimal ChangePercent { get; set; }
    public string Trend { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
}

public class SalesChartPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Purchases { get; set; }
    public int Transactions { get; set; }
}

public class PaymentMethodSliceDto
{
    public PaymentMethod Method { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal Percentage { get; set; }
}

public class CategorySalesSliceDto
{
    public Guid CategoryId { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal Percentage { get; set; }
}

public class TopSellingProductDto
{
    public Guid Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class DashboardLowStockItemDto
{
    public Guid Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; }
    public bool IsCritical { get; set; }
}

public class DashboardRecentSaleDto
{
    public Guid Id { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime SaleDate { get; set; }
}

public class BranchPerformanceDto
{
    public Guid BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public decimal SalesAmount { get; set; }
    public int Transactions { get; set; }
}

public class InventoryOverviewDto
{
    public decimal TotalInventoryValue { get; set; }
    public int TotalStockQuantity { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
}

public class DashboardNotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class DashboardSummaryDto
{
    public decimal TotalSales { get; set; }
    public int TotalProducts { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalSuppliers { get; set; }
    public int TotalWarehouses { get; set; }
    public int LowStockItems { get; set; }
}
