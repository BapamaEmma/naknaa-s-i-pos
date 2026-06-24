using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Users;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<UserListItemDto>>>> GetAll(
        [FromQuery] UserListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _userService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<UserListItemDto>>.Ok(result));
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<UserStatisticsDto>>> GetStatistics(
        CancellationToken cancellationToken)
    {
        var result = await _userService.GetStatisticsAsync(cancellationToken);
        return Ok(ApiResponse<UserStatisticsDto>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _userService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<UserDetailDto>.Ok(result));
    }

    [HttpGet("{id:guid}/activity")]
    public async Task<ActionResult<ApiResponse<PagedResult<UserActivityDto>>>> GetActivity(
        Guid id,
        [FromQuery] PaginationQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _userService.GetActivityAsync(id, query, cancellationToken);
        return Ok(ApiResponse<PagedResult<UserActivityDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> Create(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _userService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<UserDetailDto>.Ok(result, "User created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<UserDetailDto>.Ok(result, "User updated successfully"));
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword(
        Guid id,
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await _userService.ResetPasswordAsync(id, request, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Password reset successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _userService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "User deleted successfully"));
    }
}
