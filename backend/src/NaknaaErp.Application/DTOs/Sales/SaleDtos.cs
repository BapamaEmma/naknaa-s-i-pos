using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.Sales;

public class CreateSaleRequest
{
    public Guid BranchId { get; set; }
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Discount { get; set; }
    public IReadOnlyList<CreateSaleItemRequest> Items { get; set; } = [];
}

public class CreateSaleItemRequest
{
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class SaleListQuery
{
    public string? Search { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? UserId { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class SaleListItemDto
{
    public Guid Id { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public string ReceiptNumber { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public Guid UserId { get; set; }
    public string CashierName { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public SaleStatus Status { get; set; }
    public DateTime SaleDate { get; set; }
}

public class SaleDetailDto : SaleListItemDto
{
    public IReadOnlyList<SaleItemDto> Items { get; set; } = [];
}

public class SaleItemDto
{
    public Guid Id { get; set; }
    public Guid SaleId { get; set; }
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class SalesDashboardSummaryDto
{
    public decimal TodaySales { get; set; }
    public int TodayTransactions { get; set; }
    public decimal WeeklyRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
}

public class PosProductResultDto
{
    public Guid ProductId { get; set; }
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal SellingPrice { get; set; }
    public int AvailableStock { get; set; }
}

public class ReceiptDataDto : SaleDetailDto
{
}
