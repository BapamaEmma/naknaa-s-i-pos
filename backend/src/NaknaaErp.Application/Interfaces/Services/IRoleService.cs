using NaknaaErp.Application.DTOs.Roles;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IRoleService
{
    Task<IReadOnlyList<RoleListItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RoleDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RoleDetailDto> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken = default);
    Task<RoleDetailDto> UpdateAsync(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
