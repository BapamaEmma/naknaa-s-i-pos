namespace NaknaaErp.Application.Interfaces.Services;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? BranchId { get; }
    string? Username { get; }
    string? Email { get; }
    IReadOnlyList<string> Roles { get; }
    IReadOnlyList<string> Permissions { get; }
    bool IsAuthenticated { get; }
    bool HasRole(string role);
    bool HasPermission(string permission);
}
