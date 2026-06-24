using NaknaaErp.Domain.Common;
using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Domain.Entities;

public class Customer : AuditableEntity
{
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Sale> Sales { get; set; } = [];
}

public class Supplier : AuditableEntity
{
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Purchase> Purchases { get; set; } = [];
}

public class Purchase : AuditableEntity
{
    public string PurchaseNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Draft;
    public string? Notes { get; set; }
    public ICollection<PurchaseItem> Items { get; set; } = [];
}

public class PurchaseItem : BaseEntity
{
    public Guid PurchaseId { get; set; }
    public Purchase Purchase { get; set; } = null!;
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public int Quantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal CostPrice { get; set; }
    public decimal TotalCost { get; set; }
}

public class PurchaseOrder : AuditableEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Draft;
    public decimal TotalAmount { get; set; }
    public ICollection<PurchaseOrderItem> Items { get; set; } = [];
}

public class PurchaseOrderItem : BaseEntity
{
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal CostPrice { get; set; }
    public decimal TotalCost { get; set; }
}

public class Sale : AuditableEntity
{
    public string SaleNumber { get; set; } = string.Empty;
    public string ReceiptNumber { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public SaleStatus Status { get; set; } = SaleStatus.Completed;
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public ICollection<SaleItem> Items { get; set; } = [];
}

public class SaleItem : BaseEntity
{
    public Guid SaleId { get; set; }
    public Sale Sale { get; set; } = null!;
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class Service : AuditableEntity
{
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<ServiceJob> ServiceJobs { get; set; } = [];
}

public class ServiceJob : AuditableEntity
{
    public string JobNumber { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    public ServiceJobStatus Status { get; set; } = ServiceJobStatus.Pending;
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }
    public DateTime ActionDate { get; set; } = DateTime.UtcNow;
}

public class AppSetting : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
