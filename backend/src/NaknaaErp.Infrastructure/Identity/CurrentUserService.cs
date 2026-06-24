using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid? UserId => ParseGuid(User?.FindFirstValue("UserId") ?? User?.FindFirstValue(ClaimTypes.NameIdentifier));

    public Guid? BranchId => ParseGuid(User?.FindFirstValue("BranchId"));

    public string? Username => User?.FindFirstValue("Username") ?? User?.FindFirstValue(ClaimTypes.Name);

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);

    public IReadOnlyList<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Select(x => x.Value).Distinct().ToList() ?? [];

    public IReadOnlyList<string> Permissions =>
        User?.FindAll("permission").Select(x => x.Value).Distinct().ToList() ?? [];

    public bool HasRole(string role) =>
        Roles.Any(x => x.Equals(role, StringComparison.OrdinalIgnoreCase));

    public bool HasPermission(string permission) =>
        Permissions.Any(x => x.Equals(permission, StringComparison.OrdinalIgnoreCase));

    private static Guid? ParseGuid(string? value) =>
        Guid.TryParse(value, out var id) ? id : null;
}
