using NaknaaErp.Application.DTOs.ProductVariants;

namespace NaknaaErp.Application.DTOs.Products;

public class CreateProductRequest
{
    public string ProductName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string? Model { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductRequest : CreateProductRequest
{
}

public class ProductListQuery
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Brand { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ProductListItemDto
{
    public Guid Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? Model { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public int VariantCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductDetailDto : ProductListItemDto
{
    public IReadOnlyList<ProductVariantDto> Variants { get; set; } = [];
    public InventorySummaryDto InventorySummary { get; set; } = new();
}

public class InventorySummaryDto
{
    public int TotalStock { get; set; }
    public decimal InventoryValue { get; set; }
    public int LowStockVariants { get; set; }
}

public class BrandOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}
