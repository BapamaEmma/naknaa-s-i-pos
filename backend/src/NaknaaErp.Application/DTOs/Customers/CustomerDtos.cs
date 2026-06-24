namespace NaknaaErp.Application.DTOs.Customers;

public class CreateCustomerRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCustomerRequest : CreateCustomerRequest
{
}

public class CustomerListQuery
{
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class CustomerListItemDto
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public int TotalPurchases { get; set; }
    public decimal TotalAmountSpent { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CustomerDetailDto : CustomerListItemDto
{
    public CustomerStatsDto Stats { get; set; } = new();
    public IReadOnlyList<TopPurchasedProductDto> TopProducts { get; set; } = [];
    public IReadOnlyList<CustomerPurchaseDto> RecentPurchases { get; set; } = [];
}

public class CustomerStatsDto
{
    public int TotalPurchases { get; set; }
    public decimal TotalAmountSpent { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public decimal AveragePurchaseValue { get; set; }
}

public class TopPurchasedProductDto
{
    public int Rank { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int PurchaseCount { get; set; }
}

public class CustomerPurchaseDto
{
    public Guid Id { get; set; }
    public Guid SaleId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public int ItemsPurchased { get; set; }
    public string ItemSummary { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}

public class CustomerPurchaseQuery
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? PaymentMethod { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class CustomerPurchaseHistoryResultDto
{
    public IReadOnlyList<CustomerPurchaseDto> Purchases { get; set; } = [];
    public CustomerPurchaseSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<TopPurchasedProductDto> TopProducts { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

public class CustomerPurchaseSummaryDto
{
    public int TotalPurchases { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageOrderValue { get; set; }
}

public class CustomerDashboardSummaryDto
{
    public int TotalCustomers { get; set; }
    public int NewCustomersThisMonth { get; set; }
    public IReadOnlyList<CustomerSummaryItemDto> TopCustomers { get; set; } = [];
    public IReadOnlyList<CustomerSpendingItemDto> HighestSpendingCustomers { get; set; } = [];
}

public class CustomerSummaryItemDto
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public int TotalPurchases { get; set; }
}

public class CustomerSpendingItemDto
{
    public Guid Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmountSpent { get; set; }
}

public class CustomerOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
