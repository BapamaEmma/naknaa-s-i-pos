using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.Roles;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<RoleListItemDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Roles
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new RoleListItemDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                UserCount = x.Users.Count,
                PermissionCount = x.RolePermissions.Count
            })
            .ToListAsync(cancellationToken);

    public async Task<RoleDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles
            .AsNoTracking()
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Role", id);

        var userCount = await _context.Users.CountAsync(x => x.RoleId == id, cancellationToken);
        return MapDetail(role, userCount);
    }

    public async Task<RoleDetailDto> CreateAsync(
        CreateRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        if (await _context.Roles.AnyAsync(x => x.Name == request.Name, cancellationToken))
        {
            throw new ValidationException("Role name already exists.");
        }

        var role = new Role
        {
            Name = request.Name,
            Description = request.Description
        };

        await _unitOfWork.Roles.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await SyncPermissionsAsync(role.Id, request.PermissionIds, cancellationToken);
        return await GetByIdAsync(role.Id, cancellationToken);
    }

    public async Task<RoleDetailDto> UpdateAsync(
        Guid id,
        UpdateRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Role", id);

        if (await _context.Roles.AnyAsync(x => x.Id != id && x.Name == request.Name, cancellationToken))
        {
            throw new ValidationException("Role name already exists.");
        }

        role.Name = request.Name;
        role.Description = request.Description;
        _unitOfWork.Roles.Update(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await SyncPermissionsAsync(id, request.PermissionIds, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles
            .Include(x => x.Users)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Role", id);

        if (role.Users.Count > 0)
        {
            throw new ValidationException("Cannot delete a role that is assigned to users.");
        }

        var permissions = await _context.RolePermissions
            .Where(x => x.RoleId == id)
            .ToListAsync(cancellationToken);

        foreach (var permission in permissions)
        {
            _unitOfWork.RolePermissions.Remove(permission);
        }

        _unitOfWork.Roles.Remove(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task SyncPermissionsAsync(
        Guid roleId,
        IReadOnlyList<Guid> permissionIds,
        CancellationToken cancellationToken)
    {
        var existing = await _context.RolePermissions
            .Where(x => x.RoleId == roleId)
            .ToListAsync(cancellationToken);

        foreach (var item in existing)
        {
            _unitOfWork.RolePermissions.Remove(item);
        }

        if (permissionIds.Count == 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return;
        }

        var validPermissionIds = await _context.Permissions
            .Where(x => permissionIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var permissionId in validPermissionIds)
        {
            await _unitOfWork.RolePermissions.AddAsync(new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static RoleDetailDto MapDetail(Role role, int userCount) =>
        new()
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            UserCount = userCount,
            PermissionCount = role.RolePermissions.Count,
            Permissions = role.RolePermissions
                .Select(x => new RolePermissionDto
                {
                    Id = x.PermissionId,
                    Code = x.Permission.Code,
                    Name = x.Permission.Name,
                    Module = x.Permission.Module
                })
                .OrderBy(x => x.Module)
                .ThenBy(x => x.Name)
                .ToList(),
            CreatedAt = role.CreatedAt,
            UpdatedAt = role.UpdatedAt
        };
}
