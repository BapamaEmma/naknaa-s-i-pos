namespace NaknaaErp.Application.DTOs.ProductVariants;

public class CreateProductVariantRequest
{
    public Guid ProductId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductVariantRequest
{
    public string VariantName { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public int CurrentStock { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class VariantOptionDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CurrentQuantity { get; set; }
    public int MinimumStock { get; set; }
    public decimal UnitCost { get; set; }
}
