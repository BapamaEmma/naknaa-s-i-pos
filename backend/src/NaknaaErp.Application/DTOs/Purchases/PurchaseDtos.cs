using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.Purchases;

public class CreatePurchaseRequest
{
    public Guid SupplierId { get; set; }
    public Guid WarehouseId { get; set; }
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Draft;
    public string? Notes { get; set; }
    public IReadOnlyList<PurchaseItemRequest> Items { get; set; } = [];
}

public class UpdatePurchaseRequest : CreatePurchaseRequest
{
}

public class PurchaseItemRequest
{
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal CostPrice { get; set; }
    public string Section { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Bin { get; set; } = string.Empty;
}

public class ReceivePurchaseRequest
{
    public Guid PurchaseId { get; set; }
    public IReadOnlyList<ReceivePurchaseItemRequest> Items { get; set; } = [];
}

public class ReceivePurchaseItemRequest
{
    public Guid PurchaseItemId { get; set; }
    public int Quantity { get; set; }
}

public class PurchaseListQuery
{
    public string? Search { get; set; }
    public Guid? WarehouseId { get; set; }
    public PurchaseStatus? Status { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PurchaseListItemDto
{
    public Guid Id { get; set; }
    public string PurchaseNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public decimal TotalAmount { get; set; }
    public PurchaseStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PurchaseDetailDto : PurchaseListItemDto
{
    public IReadOnlyList<PurchaseItemDto> Items { get; set; } = [];
}

public class PurchaseItemDto
{
    public Guid Id { get; set; }
    public Guid PurchaseId { get; set; }
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal CostPrice { get; set; }
    public decimal TotalCost { get; set; }
}

public class PurchaseDashboardSummaryDto
{
    public int TotalPurchases { get; set; }
    public decimal PurchaseValue { get; set; }
    public int PendingPurchases { get; set; }
    public int ReceivedPurchases { get; set; }
}

public class PurchaseReportQuery
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public Guid? WarehouseId { get; set; }
    public Guid? SupplierId { get; set; }
}

public class PurchaseReportsDto
{
    public int TotalPurchases { get; set; }
    public decimal TotalPurchaseValue { get; set; }
    public IReadOnlyList<PurchaseBySupplierReportDto> BySupplier { get; set; } = [];
    public IReadOnlyList<PurchaseByWarehouseReportDto> ByWarehouse { get; set; } = [];
    public IReadOnlyList<MonthlyPurchaseReportDto> Monthly { get; set; } = [];
}

public class PurchaseBySupplierReportDto
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int TotalPurchases { get; set; }
    public decimal TotalAmount { get; set; }
}

public class PurchaseByWarehouseReportDto
{
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int TotalPurchases { get; set; }
    public decimal TotalAmount { get; set; }
}

public class MonthlyPurchaseReportDto
{
    public string Month { get; set; } = string.Empty;
    public int Purchases { get; set; }
    public decimal Value { get; set; }
}
