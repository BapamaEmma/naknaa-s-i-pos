using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Users;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<UserListItemDto>> GetAllAsync(UserListQuery query, CancellationToken cancellationToken = default)
    {
        var usersQuery = _context.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            usersQuery = usersQuery.Where(x =>
                x.FirstName.ToLower().Contains(search) ||
                x.LastName.ToLower().Contains(search) ||
                x.Username.ToLower().Contains(search) ||
                x.Email.ToLower().Contains(search));
        }

        if (query.RoleId.HasValue)
        {
            usersQuery = usersQuery.Where(x => x.RoleId == query.RoleId);
        }

        if (query.BranchId.HasValue)
        {
            usersQuery = usersQuery.Where(x => x.BranchId == query.BranchId);
        }

        if (query.IsActive.HasValue)
        {
            usersQuery = usersQuery.Where(x => x.IsActive == query.IsActive);
        }

        var total = await usersQuery.CountAsync(cancellationToken);
        var items = await usersQuery
            .OrderBy(x => x.FirstName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new UserListItemDto
            {
                Id = x.Id,
                FullName = $"{x.FirstName} {x.LastName}",
                Username = x.Username,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber ?? string.Empty,
                RoleId = x.RoleId,
                RoleName = x.Role.Name,
                BranchId = x.BranchId,
                BranchName = x.Branch.BranchName,
                IsActive = x.IsActive
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<UserListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<UserDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("User", id);

        var permissions = await _context.RolePermissions
            .Where(x => x.RoleId == user.RoleId)
            .Include(x => x.Permission)
            .Select(x => x.Permission.Code)
            .ToListAsync(cancellationToken);

        return MapDetail(user, permissions);
    }

    public async Task<UserDetailDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        if (await _context.Users.AnyAsync(
                x => x.Username == request.Username || x.Email == request.Email,
                cancellationToken))
        {
            throw new ValidationException("Username or email already exists.");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            BranchId = request.BranchId,
            IsActive = true
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(user.Id, cancellationToken);
    }

    public async Task<UserDetailDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("User", id);

        if (await _context.Users.AnyAsync(
                x => x.Id != id && (x.Username == request.Username || x.Email == request.Email),
                cancellationToken))
        {
            throw new ValidationException("Username or email already exists.");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Username = request.Username;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        user.RoleId = request.RoleId;
        user.BranchId = request.BranchId;
        user.IsActive = request.IsActive;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("User", id);
        user.IsActive = false;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ResetPasswordAsync(Guid id, ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("User", id);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.AsNoTracking().ToListAsync(cancellationToken);
        return new UserStatisticsDto
        {
            TotalUsers = users.Count,
            ActiveUsers = users.Count(x => x.IsActive),
            InactiveUsers = users.Count(x => !x.IsActive)
        };
    }

    public async Task<PagedResult<UserActivityDto>> GetActivityAsync(
        Guid id,
        PaginationQuery query,
        CancellationToken cancellationToken = default)
    {
        var logsQuery = _context.AuditLogs
            .AsNoTracking()
            .Include(x => x.Branch)
            .Where(x => x.UserId == id);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            logsQuery = logsQuery.Where(x =>
                x.Action.ToLower().Contains(search) ||
                x.Entity.ToLower().Contains(search) ||
                (x.Details != null && x.Details.ToLower().Contains(search)));
        }

        var total = await logsQuery.CountAsync(cancellationToken);
        var items = await logsQuery
            .OrderByDescending(x => x.ActionDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new UserActivityDto
            {
                Id = x.Id,
                UserId = x.UserId ?? id,
                Activity = x.Action,
                Module = x.Entity,
                BranchId = x.BranchId,
                BranchName = x.Branch != null ? x.Branch.BranchName : string.Empty,
                CreatedAt = x.ActionDate
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<UserActivityDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    private static UserDetailDto MapDetail(User user, IReadOnlyList<string> permissions) =>
        new()
        {
            Id = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Username = user.Username,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            RoleId = user.RoleId,
            RoleName = user.Role.Name,
            BranchId = user.BranchId,
            BranchName = user.Branch.BranchName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Permissions = permissions
        };
}
