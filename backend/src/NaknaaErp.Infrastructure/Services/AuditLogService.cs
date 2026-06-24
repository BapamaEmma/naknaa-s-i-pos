using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.AuditLogs;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public AuditLogService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<AuditLogDto>> GetAllAsync(
        AuditLogListQuery query,
        CancellationToken cancellationToken = default)
    {
        var logsQuery = _context.AuditLogs
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Branch)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            logsQuery = logsQuery.Where(x =>
                x.Action.ToLower().Contains(search) ||
                x.Entity.ToLower().Contains(search) ||
                (x.Details != null && x.Details.ToLower().Contains(search)));
        }

        if (query.UserId.HasValue)
        {
            logsQuery = logsQuery.Where(x => x.UserId == query.UserId);
        }

        if (query.BranchId.HasValue)
        {
            logsQuery = logsQuery.Where(x => x.BranchId == query.BranchId);
        }

        if (!string.IsNullOrWhiteSpace(query.Entity))
        {
            logsQuery = logsQuery.Where(x => x.Entity == query.Entity);
        }

        if (query.DateFrom.HasValue)
        {
            logsQuery = logsQuery.Where(x => x.ActionDate >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            logsQuery = logsQuery.Where(x => x.ActionDate <= query.DateTo);
        }

        var total = await logsQuery.CountAsync(cancellationToken);
        var items = await logsQuery
            .OrderByDescending(x => x.ActionDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new AuditLogDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserName = x.User != null ? $"{x.User.FirstName} {x.User.LastName}" : string.Empty,
                Action = x.Action,
                Entity = x.Entity,
                EntityId = x.EntityId,
                Details = x.Details,
                BranchId = x.BranchId,
                BranchName = x.Branch != null ? x.Branch.BranchName : string.Empty,
                ActionDate = x.ActionDate
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<AuditLogDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var log = await _context.AuditLogs
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("AuditLog", id);

        return new AuditLogDto
        {
            Id = log.Id,
            UserId = log.UserId,
            UserName = log.User != null ? $"{log.User.FirstName} {log.User.LastName}" : string.Empty,
            Action = log.Action,
            Entity = log.Entity,
            EntityId = log.EntityId,
            Details = log.Details,
            BranchId = log.BranchId,
            BranchName = log.Branch?.BranchName ?? string.Empty,
            ActionDate = log.ActionDate
        };
    }

    public async Task LogAsync(CreateAuditLogRequest request, CancellationToken cancellationToken = default)
    {
        var log = new AuditLog
        {
            UserId = request.UserId ?? _currentUserService.UserId,
            Action = request.Action,
            Entity = request.Entity,
            EntityId = request.EntityId,
            Details = request.Details,
            BranchId = request.BranchId ?? _currentUserService.BranchId,
            ActionDate = DateTime.UtcNow
        };

        await _unitOfWork.AuditLogs.AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
