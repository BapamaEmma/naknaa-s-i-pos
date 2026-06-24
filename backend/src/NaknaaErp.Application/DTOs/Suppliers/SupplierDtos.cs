namespace NaknaaErp.Application.DTOs.Suppliers;

public class CreateSupplierRequest
{
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateSupplierRequest : CreateSupplierRequest
{
}

public class SupplierListQuery
{
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class SupplierListItemDto
{
    public Guid Id { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public int ProductCount { get; set; }
    public decimal TotalPurchaseValue { get; set; }
    public DateTime? LastSupplyDate { get; set; }
    public bool IsActive { get; set; }
}

public class SupplierDetailDto
{
    public Guid Id { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public SupplierStatisticsDto Stats { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SupplierStatisticsDto
{
    public int TotalProductsSupplied { get; set; }
    public int TotalQuantitySupplied { get; set; }
    public decimal TotalPurchaseValue { get; set; }
    public DateTime? LastSupplyDate { get; set; }
}

public class SupplierOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
