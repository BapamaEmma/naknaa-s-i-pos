using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.Settings;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class SettingsService : ISettingsService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public SettingsService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<BusinessSettingsDto> GetBusinessSettingsAsync(CancellationToken cancellationToken = default) =>
        await GetSettingAsync("Business", new BusinessSettingsDto(), cancellationToken);

    public async Task<BusinessSettingsDto> UpdateBusinessSettingsAsync(
        UpdateBusinessSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var updated = new BusinessSettingsDto
        {
            BusinessName = request.BusinessName,
            BusinessLogo = request.BusinessLogo,
            BusinessPhone = request.BusinessPhone,
            AlternatePhone = request.AlternatePhone,
            EmailAddress = request.EmailAddress,
            Website = request.Website,
            BusinessAddress = request.BusinessAddress,
            City = request.City,
            Country = request.Country,
            TaxIdentificationNumber = request.TaxIdentificationNumber,
            UpdatedAt = DateTime.UtcNow
        };

        await SaveSettingAsync("Business", updated, cancellationToken);
        await SaveScalarSettingAsync("Business", "BusinessName", request.BusinessName, cancellationToken);
        return updated;
    }

    public async Task<ReceiptSettingsDto> GetReceiptSettingsAsync(CancellationToken cancellationToken = default) =>
        await GetSettingAsync("Receipt", new ReceiptSettingsDto(), cancellationToken);

    public async Task<ReceiptSettingsDto> UpdateReceiptSettingsAsync(
        UpdateReceiptSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var updated = new ReceiptSettingsDto
        {
            ReceiptHeader = request.ReceiptHeader,
            ReceiptFooter = request.ReceiptFooter,
            ShowBusinessLogo = request.ShowBusinessLogo,
            ShowCustomerDetails = request.ShowCustomerDetails,
            ShowCashierName = request.ShowCashierName,
            ShowBranchName = request.ShowBranchName,
            ReceiptSize = request.ReceiptSize,
            ReceiptNumberPrefix = request.ReceiptNumberPrefix,
            ReceiptNumberFormat = request.ReceiptNumberFormat,
            UpdatedAt = DateTime.UtcNow
        };

        await SaveSettingAsync("Receipt", updated, cancellationToken);
        return updated;
    }

    public async Task<SecuritySettingsDto> GetSecuritySettingsAsync(CancellationToken cancellationToken = default) =>
        await GetSettingAsync("Security", new SecuritySettingsDto
        {
            PasswordExpiryDays = 90,
            SessionTimeoutMinutes = 30,
            LoginAttemptLimit = 5,
            TwoFactorEnabled = false,
            UserLockoutEnabled = true,
            UpdatedAt = DateTime.UtcNow
        }, cancellationToken);

    public async Task<SecuritySettingsDto> UpdateSecuritySettingsAsync(
        UpdateSecuritySettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var updated = new SecuritySettingsDto
        {
            PasswordExpiryDays = request.PasswordExpiryDays,
            SessionTimeoutMinutes = request.SessionTimeoutMinutes,
            LoginAttemptLimit = request.LoginAttemptLimit,
            TwoFactorEnabled = request.TwoFactorEnabled,
            UserLockoutEnabled = request.UserLockoutEnabled,
            UpdatedAt = DateTime.UtcNow
        };

        await SaveSettingAsync("Security", updated, cancellationToken);
        return updated;
    }

    public async Task<NotificationSettingsDto> GetNotificationSettingsAsync(CancellationToken cancellationToken = default) =>
        await GetSettingAsync("Notification", new NotificationSettingsDto
        {
            LowStockAlerts = true,
            NewSaleNotifications = true,
            WarehouseTransferNotifications = true,
            NewUserNotifications = true,
            SystemAlerts = true,
            InAppDelivery = true,
            EmailDelivery = false,
            WhatsAppDelivery = false,
            UpdatedAt = DateTime.UtcNow
        }, cancellationToken);

    public async Task<NotificationSettingsDto> UpdateNotificationSettingsAsync(
        UpdateNotificationSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var updated = new NotificationSettingsDto
        {
            LowStockAlerts = request.LowStockAlerts,
            NewSaleNotifications = request.NewSaleNotifications,
            WarehouseTransferNotifications = request.WarehouseTransferNotifications,
            NewUserNotifications = request.NewUserNotifications,
            SystemAlerts = request.SystemAlerts,
            InAppDelivery = request.InAppDelivery,
            EmailDelivery = request.EmailDelivery,
            WhatsAppDelivery = request.WhatsAppDelivery,
            UpdatedAt = DateTime.UtcNow
        };

        await SaveSettingAsync("Notification", updated, cancellationToken);
        return updated;
    }

    public async Task<SystemSettingsDto> GetSystemSettingsAsync(CancellationToken cancellationToken = default) =>
        await GetSettingAsync("System", new SystemSettingsDto
        {
            Currency = "GHS",
            DateFormat = "DD/MM/YYYY",
            TimeFormat = "24h",
            ThemeMode = "system",
            Numbering = new NumberingSettingsDto
            {
                ReceiptPrefix = "NAK",
                ReceiptFormat = "NAK-{year}-{sequence}",
                CustomerPrefix = "CUS",
                CustomerFormat = "CUS-{sequence}",
                SupplierPrefix = "SUP",
                SupplierFormat = "SUP-{sequence}",
                ProductPrefix = "PRD",
                ProductFormat = "PRD-{sequence}",
                WarehousePrefix = "WH",
                WarehouseFormat = "WH-{sequence}"
            },
            UpdatedAt = DateTime.UtcNow
        }, cancellationToken);

    public async Task<SystemSettingsDto> UpdateSystemSettingsAsync(
        UpdateSystemSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var updated = new SystemSettingsDto
        {
            Currency = request.Currency,
            DateFormat = request.DateFormat,
            TimeFormat = request.TimeFormat,
            ThemeMode = request.ThemeMode,
            Numbering = request.Numbering,
            UpdatedAt = DateTime.UtcNow
        };

        await SaveSettingAsync("System", updated, cancellationToken);
        return updated;
    }

    public async Task<IReadOnlyList<SettingsBranchDto>> GetBranchesAsync(CancellationToken cancellationToken = default) =>
        await _context.Branches
            .AsNoTracking()
            .OrderBy(x => x.BranchName)
            .Select(x => new SettingsBranchDto
            {
                Id = x.Id,
                BranchName = x.BranchName,
                BranchCode = x.BranchCode,
                Address = x.Address,
                PhoneNumber = x.PhoneNumber,
                Status = x.Status,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

    public async Task<SettingsBranchDto> CreateBranchAsync(
        CreateBranchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (await _context.Branches.AnyAsync(x => x.BranchCode == request.BranchCode, cancellationToken))
        {
            throw new ValidationException("Branch code already exists.");
        }

        var branch = new Branch
        {
            BranchCode = request.BranchCode,
            BranchName = request.BranchName,
            Address = request.Address,
            PhoneNumber = request.PhoneNumber,
            Status = request.Status
        };

        await _unitOfWork.Branches.AddAsync(branch, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SettingsBranchDto
        {
            Id = branch.Id,
            BranchName = branch.BranchName,
            BranchCode = branch.BranchCode,
            Address = branch.Address,
            PhoneNumber = branch.PhoneNumber,
            Status = branch.Status,
            CreatedAt = branch.CreatedAt
        };
    }

    public async Task<SettingsBranchDto> UpdateBranchAsync(
        Guid id,
        UpdateBranchRequest request,
        CancellationToken cancellationToken = default)
    {
        var branch = await _context.Branches.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Branch", id);

        if (await _context.Branches.AnyAsync(x => x.Id != id && x.BranchCode == request.BranchCode, cancellationToken))
        {
            throw new ValidationException("Branch code already exists.");
        }

        branch.BranchName = request.BranchName;
        branch.BranchCode = request.BranchCode;
        branch.Address = request.Address;
        branch.PhoneNumber = request.PhoneNumber;
        branch.Status = request.Status;

        _unitOfWork.Branches.Update(branch);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SettingsBranchDto
        {
            Id = branch.Id,
            BranchName = branch.BranchName,
            BranchCode = branch.BranchCode,
            Address = branch.Address,
            PhoneNumber = branch.PhoneNumber,
            Status = branch.Status,
            CreatedAt = branch.CreatedAt
        };
    }

    public async Task DeleteBranchAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var branch = await _unitOfWork.Branches.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Branch", id);
        branch.Status = EntityStatus.Inactive;
        _unitOfWork.Branches.Update(branch);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<T> GetSettingAsync<T>(string category, T defaultValue, CancellationToken cancellationToken)
        where T : class
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Category == category && x.Key == "Payload", cancellationToken);

        if (setting is null)
        {
            return defaultValue;
        }

        return JsonSerializer.Deserialize<T>(setting.Value, JsonOptions) ?? defaultValue;
    }

    private async Task SaveSettingAsync<T>(string category, T value, CancellationToken cancellationToken)
        where T : class
    {
        var json = JsonSerializer.Serialize(value, JsonOptions);
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(x => x.Category == category && x.Key == "Payload", cancellationToken);

        if (setting is null)
        {
            setting = new AppSetting { Category = category, Key = "Payload", Value = json };
            await _context.AppSettings.AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.Value = json;
            _context.AppSettings.Update(setting);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task SaveScalarSettingAsync(
        string category,
        string key,
        string value,
        CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(x => x.Category == category && x.Key == key, cancellationToken);

        if (setting is null)
        {
            await _context.AppSettings.AddAsync(new AppSetting
            {
                Category = category,
                Key = key,
                Value = value
            }, cancellationToken);
        }
        else
        {
            setting.Value = value;
            _context.AppSettings.Update(setting);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
