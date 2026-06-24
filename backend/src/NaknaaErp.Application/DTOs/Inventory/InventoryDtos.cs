using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.Inventory;

public class InventoryListQuery
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? WarehouseId { get; set; }
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class InventoryListItemDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Bin { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int MinimumStockLevel { get; set; }
    public decimal UnitCost { get; set; }
    public decimal StockValue { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? LastUpdated { get; set; }
}

public class InventoryDashboardSummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalStockQuantity { get; set; }
    public decimal InventoryValue { get; set; }
    public int LowStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
}

public class InventoryHistoryQuery
{
    public string? Search { get; set; }
    public Guid? WarehouseId { get; set; }
    public Guid? ProductVariantId { get; set; }
    public InventoryTransactionType? TransactionType { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class InventoryTransactionDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public InventoryTransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class StockInRequest
{
    public Guid ProductVariantId { get; set; }
    public Guid WarehouseId { get; set; }
    public string Section { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Bin { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? Supplier { get; set; }
    public string? Notes { get; set; }
}

public class StockOutRequest
{
    public Guid ProductVariantId { get; set; }
    public Guid WarehouseId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class InventoryAdjustmentRequest
{
    public Guid ProductVariantId { get; set; }
    public Guid WarehouseId { get; set; }
    public int NewQuantity { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ProductAvailabilitySearchResultDto
{
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Query { get; set; } = string.Empty;
    public IReadOnlyList<ProductLocatorResultDto> Results { get; set; } = [];
}

public class ProductLocatorResultDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid ProductVariantId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public IReadOnlyList<ProductLocationDto> Locations { get; set; } = [];
    public int TotalQuantity { get; set; }
}

public class ProductLocationDto
{
    public Guid WarehouseId { get; set; }
    public string Warehouse { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Bin { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
