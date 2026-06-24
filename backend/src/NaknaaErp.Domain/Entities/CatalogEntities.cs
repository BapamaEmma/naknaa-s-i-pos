using NaknaaErp.Domain.Common;
using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Domain.Entities;

public class Warehouse : AuditableEntity
{
    public string WarehouseCode { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Manager { get; set; }
    public EntityStatus Status { get; set; } = EntityStatus.Active;
    public ICollection<InventoryRecord> InventoryRecords { get; set; } = [];
    public ICollection<Purchase> Purchases { get; set; } = [];
}

public class Category : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Product> Products { get; set; } = [];
}

public class Product : AuditableEntity
{
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Brand { get; set; } = string.Empty;
    public string? Model { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<ProductVariant> Variants { get; set; } = [];
}

public class ProductVariant : AuditableEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string VariantName { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<InventoryRecord> InventoryRecords { get; set; } = [];
}

public class InventoryRecord : AuditableEntity
{
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public string Section { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Bin { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int MinimumStockLevel { get; set; }
}

public class InventoryTransaction : AuditableEntity
{
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public InventoryTransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }
}
