using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.Warehouses;

public class CreateWarehouseRequest
{
    public string WarehouseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Manager { get; set; }
    public EntityStatus Status { get; set; } = EntityStatus.Active;
}

public class UpdateWarehouseRequest : CreateWarehouseRequest
{
}

public class WarehouseListQuery
{
    public string? Search { get; set; }
    public EntityStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class WarehouseListItemDto
{
    public Guid Id { get; set; }
    public string WarehouseCode { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TotalProducts { get; set; }
    public int TotalStockQuantity { get; set; }
    public EntityStatus Status { get; set; }
}

public class WarehouseDetailDto
{
    public Guid Id { get; set; }
    public string WarehouseCode { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Manager { get; set; }
    public EntityStatus Status { get; set; }
    public int TotalProducts { get; set; }
    public int TotalStockQuantity { get; set; }
    public decimal InventoryValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class WarehouseDashboardSummaryDto
{
    public int TotalWarehouses { get; set; }
    public int TotalInventoryQuantity { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int LowStockItems { get; set; }
    public int TransfersThisMonth { get; set; }
}

public class InventoryLocationQuery
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public string? StockStatus { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class WarehouseStockRecordDto
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string Rack { get; set; } = string.Empty;
    public string Bin { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid ProductVariantId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
}

public class TransferListQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class CreateTransferRequest
{
    public Guid FromWarehouseId { get; set; }
    public Guid ToWarehouseId { get; set; }
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class WarehouseTransferDto
{
    public Guid Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public Guid FromWarehouseId { get; set; }
    public string FromWarehouseName { get; set; } = string.Empty;
    public Guid ToWarehouseId { get; set; }
    public string ToWarehouseName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
