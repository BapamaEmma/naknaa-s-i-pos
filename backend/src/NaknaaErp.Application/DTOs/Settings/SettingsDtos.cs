using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.Settings;

public class BusinessSettingsDto
{
    public string BusinessName { get; set; } = string.Empty;
    public string? BusinessLogo { get; set; }
    public string BusinessPhone { get; set; } = string.Empty;
    public string AlternatePhone { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string BusinessAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string TaxIdentificationNumber { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateBusinessSettingsRequest
{
    public string BusinessName { get; set; } = string.Empty;
    public string? BusinessLogo { get; set; }
    public string BusinessPhone { get; set; } = string.Empty;
    public string AlternatePhone { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string BusinessAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string TaxIdentificationNumber { get; set; } = string.Empty;
}

public class ReceiptSettingsDto
{
    public string ReceiptHeader { get; set; } = string.Empty;
    public string ReceiptFooter { get; set; } = string.Empty;
    public bool ShowBusinessLogo { get; set; }
    public bool ShowCustomerDetails { get; set; }
    public bool ShowCashierName { get; set; }
    public bool ShowBranchName { get; set; }
    public string ReceiptSize { get; set; } = "80mm";
    public string ReceiptNumberPrefix { get; set; } = string.Empty;
    public string ReceiptNumberFormat { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateReceiptSettingsRequest
{
    public string ReceiptHeader { get; set; } = string.Empty;
    public string ReceiptFooter { get; set; } = string.Empty;
    public bool ShowBusinessLogo { get; set; }
    public bool ShowCustomerDetails { get; set; }
    public bool ShowCashierName { get; set; }
    public bool ShowBranchName { get; set; }
    public string ReceiptSize { get; set; } = "80mm";
    public string ReceiptNumberPrefix { get; set; } = string.Empty;
    public string ReceiptNumberFormat { get; set; } = string.Empty;
}

public class SecuritySettingsDto
{
    public int PasswordExpiryDays { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int LoginAttemptLimit { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool UserLockoutEnabled { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateSecuritySettingsRequest
{
    public int PasswordExpiryDays { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int LoginAttemptLimit { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool UserLockoutEnabled { get; set; }
}

public class NotificationSettingsDto
{
    public bool LowStockAlerts { get; set; }
    public bool NewSaleNotifications { get; set; }
    public bool WarehouseTransferNotifications { get; set; }
    public bool NewUserNotifications { get; set; }
    public bool SystemAlerts { get; set; }
    public bool InAppDelivery { get; set; }
    public bool EmailDelivery { get; set; }
    public bool WhatsAppDelivery { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateNotificationSettingsRequest
{
    public bool LowStockAlerts { get; set; }
    public bool NewSaleNotifications { get; set; }
    public bool WarehouseTransferNotifications { get; set; }
    public bool NewUserNotifications { get; set; }
    public bool SystemAlerts { get; set; }
    public bool InAppDelivery { get; set; }
    public bool EmailDelivery { get; set; }
    public bool WhatsAppDelivery { get; set; }
}

public class SystemSettingsDto
{
    public string Currency { get; set; } = "GHS";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string TimeFormat { get; set; } = "24h";
    public string ThemeMode { get; set; } = "system";
    public NumberingSettingsDto Numbering { get; set; } = new();
    public DateTime UpdatedAt { get; set; }
}

public class NumberingSettingsDto
{
    public string ReceiptPrefix { get; set; } = string.Empty;
    public string ReceiptFormat { get; set; } = string.Empty;
    public string CustomerPrefix { get; set; } = string.Empty;
    public string CustomerFormat { get; set; } = string.Empty;
    public string SupplierPrefix { get; set; } = string.Empty;
    public string SupplierFormat { get; set; } = string.Empty;
    public string ProductPrefix { get; set; } = string.Empty;
    public string ProductFormat { get; set; } = string.Empty;
    public string WarehousePrefix { get; set; } = string.Empty;
    public string WarehouseFormat { get; set; } = string.Empty;
}

public class UpdateSystemSettingsRequest
{
    public string Currency { get; set; } = "GHS";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string TimeFormat { get; set; } = "24h";
    public string ThemeMode { get; set; } = "system";
    public NumberingSettingsDto Numbering { get; set; } = new();
}

public class SettingsBranchDto
{
    public Guid Id { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public EntityStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBranchRequest
{
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public EntityStatus Status { get; set; } = EntityStatus.Active;
}

public class UpdateBranchRequest
{
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public EntityStatus Status { get; set; } = EntityStatus.Active;
}
