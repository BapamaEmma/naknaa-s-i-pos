using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Users;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IUserService
{
    Task<PagedResult<UserListItemDto>> GetAllAsync(UserListQuery query, CancellationToken cancellationToken = default);
    Task<UserDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserDetailDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDetailDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(Guid id, ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<UserStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<UserActivityDto>> GetActivityAsync(Guid id, PaginationQuery query, CancellationToken cancellationToken = default);
}
