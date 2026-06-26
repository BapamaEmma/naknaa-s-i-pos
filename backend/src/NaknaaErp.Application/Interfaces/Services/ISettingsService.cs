using NaknaaErp.Application.DTOs.Settings;

namespace NaknaaErp.Application.Interfaces.Services;

public interface ISettingsService
{
    Task<BusinessSettingsDto> GetBusinessSettingsAsync(CancellationToken cancellationToken = default);
    Task<BusinessSettingsDto> UpdateBusinessSettingsAsync(UpdateBusinessSettingsRequest request, CancellationToken cancellationToken = default);
    Task<ReceiptSettingsDto> GetReceiptSettingsAsync(CancellationToken cancellationToken = default);
    Task<ReceiptSettingsDto> UpdateReceiptSettingsAsync(UpdateReceiptSettingsRequest request, CancellationToken cancellationToken = default);
    Task<SecuritySettingsDto> GetSecuritySettingsAsync(CancellationToken cancellationToken = default);
    Task<SecuritySettingsDto> UpdateSecuritySettingsAsync(UpdateSecuritySettingsRequest request, CancellationToken cancellationToken = default);
    Task<NotificationSettingsDto> GetNotificationSettingsAsync(CancellationToken cancellationToken = default);
    Task<NotificationSettingsDto> UpdateNotificationSettingsAsync(UpdateNotificationSettingsRequest request, CancellationToken cancellationToken = default);
    Task<SystemSettingsDto> GetSystemSettingsAsync(CancellationToken cancellationToken = default);
    Task<SystemSettingsDto> UpdateSystemSettingsAsync(UpdateSystemSettingsRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SettingsBranchDto>> GetBranchesAsync(CancellationToken cancellationToken = default);
    Task<SettingsBranchDto> CreateBranchAsync(CreateBranchRequest request, CancellationToken cancellationToken = default);
    Task<SettingsBranchDto> UpdateBranchAsync(Guid id, UpdateBranchRequest request, CancellationToken cancellationToken = default);
    Task DeleteBranchAsync(Guid id, CancellationToken cancellationToken = default);
}
