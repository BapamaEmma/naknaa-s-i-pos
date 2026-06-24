using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Settings;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet("business")]
    public async Task<ActionResult<ApiResponse<BusinessSettingsDto>>> GetBusinessSettings(
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetBusinessSettingsAsync(cancellationToken);
        return Ok(ApiResponse<BusinessSettingsDto>.Ok(result));
    }

    [HttpPut("business")]
    public async Task<ActionResult<ApiResponse<BusinessSettingsDto>>> UpdateBusinessSettings(
        [FromBody] UpdateBusinessSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateBusinessSettingsAsync(request, cancellationToken);
        return Ok(ApiResponse<BusinessSettingsDto>.Ok(result, "Business settings updated successfully"));
    }

    [HttpGet("receipts")]
    public async Task<ActionResult<ApiResponse<ReceiptSettingsDto>>> GetReceiptSettings(
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetReceiptSettingsAsync(cancellationToken);
        return Ok(ApiResponse<ReceiptSettingsDto>.Ok(result));
    }

    [HttpPut("receipts")]
    public async Task<ActionResult<ApiResponse<ReceiptSettingsDto>>> UpdateReceiptSettings(
        [FromBody] UpdateReceiptSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateReceiptSettingsAsync(request, cancellationToken);
        return Ok(ApiResponse<ReceiptSettingsDto>.Ok(result, "Receipt settings updated successfully"));
    }

    [HttpGet("security")]
    public async Task<ActionResult<ApiResponse<SecuritySettingsDto>>> GetSecuritySettings(
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetSecuritySettingsAsync(cancellationToken);
        return Ok(ApiResponse<SecuritySettingsDto>.Ok(result));
    }

    [HttpPut("security")]
    public async Task<ActionResult<ApiResponse<SecuritySettingsDto>>> UpdateSecuritySettings(
        [FromBody] UpdateSecuritySettingsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateSecuritySettingsAsync(request, cancellationToken);
        return Ok(ApiResponse<SecuritySettingsDto>.Ok(result, "Security settings updated successfully"));
    }

    [HttpGet("notifications")]
    public async Task<ActionResult<ApiResponse<NotificationSettingsDto>>> GetNotificationSettings(
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetNotificationSettingsAsync(cancellationToken);
        return Ok(ApiResponse<NotificationSettingsDto>.Ok(result));
    }

    [HttpPut("notifications")]
    public async Task<ActionResult<ApiResponse<NotificationSettingsDto>>> UpdateNotificationSettings(
        [FromBody] UpdateNotificationSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateNotificationSettingsAsync(request, cancellationToken);
        return Ok(ApiResponse<NotificationSettingsDto>.Ok(result, "Notification settings updated successfully"));
    }

    [HttpGet("system")]
    public async Task<ActionResult<ApiResponse<SystemSettingsDto>>> GetSystemSettings(
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetSystemSettingsAsync(cancellationToken);
        return Ok(ApiResponse<SystemSettingsDto>.Ok(result));
    }

    [HttpPut("system")]
    public async Task<ActionResult<ApiResponse<SystemSettingsDto>>> UpdateSystemSettings(
        [FromBody] UpdateSystemSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateSystemSettingsAsync(request, cancellationToken);
        return Ok(ApiResponse<SystemSettingsDto>.Ok(result, "System settings updated successfully"));
    }

    [HttpGet("branches")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SettingsBranchDto>>>> GetBranches(
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetBranchesAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<SettingsBranchDto>>.Ok(result));
    }

    [HttpPost("branches")]
    public async Task<ActionResult<ApiResponse<SettingsBranchDto>>> CreateBranch(
        [FromBody] CreateBranchRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.CreateBranchAsync(request, cancellationToken);
        return Ok(ApiResponse<SettingsBranchDto>.Ok(result, "Branch created successfully"));
    }

    [HttpPut("branches/{id:guid}")]
    public async Task<ActionResult<ApiResponse<SettingsBranchDto>>> UpdateBranch(
        Guid id,
        [FromBody] UpdateBranchRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateBranchAsync(id, request, cancellationToken);
        return Ok(ApiResponse<SettingsBranchDto>.Ok(result, "Branch updated successfully"));
    }

    [HttpDelete("branches/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBranch(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _settingsService.DeleteBranchAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Branch deleted successfully"));
    }
}
