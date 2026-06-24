using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.AuditLogs;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetAll(
        [FromQuery] AuditLogListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _auditLogService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<AuditLogDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AuditLogDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _auditLogService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<AuditLogDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Create(
        [FromBody] CreateAuditLogRequest request,
        CancellationToken cancellationToken)
    {
        await _auditLogService.LogAsync(request, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Audit log recorded successfully"));
    }
}
