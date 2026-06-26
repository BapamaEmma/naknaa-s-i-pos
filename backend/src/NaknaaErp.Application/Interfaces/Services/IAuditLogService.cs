using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.AuditLogs;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetAllAsync(AuditLogListQuery query, CancellationToken cancellationToken = default);
    Task<AuditLogDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task LogAsync(CreateAuditLogRequest request, CancellationToken cancellationToken = default);
}
