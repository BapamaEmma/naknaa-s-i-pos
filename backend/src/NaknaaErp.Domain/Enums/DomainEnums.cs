namespace NaknaaErp.Domain.Enums;

public enum EntityStatus
{
    Active = 1,
    Inactive = 2
}

public enum PurchaseStatus
{
    Draft = 1,
    Ordered = 2,
    Received = 3,
    Cancelled = 4
}

public enum PaymentMethod
{
    Cash = 1,
    MobileMoney = 2
}

public enum ServiceJobStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}

public enum InventoryTransactionType
{
    StockIn = 1,
    StockOut = 2,
    Adjustment = 3,
    PurchaseReceive = 4,
    Sale = 5,
    Transfer = 6
}

public enum SaleStatus
{
    Completed = 1,
    Voided = 2,
    Refunded = 3
}
