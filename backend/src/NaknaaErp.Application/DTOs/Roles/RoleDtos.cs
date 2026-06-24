namespace NaknaaErp.Application.DTOs.Roles;

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IReadOnlyList<Guid> PermissionIds { get; set; } = [];
}

public class UpdateRoleRequest : CreateRoleRequest
{
}

public class RoleListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public int PermissionCount { get; set; }
}

public class RoleDetailDto : RoleListItemDto
{
    public IReadOnlyList<RolePermissionDto> Permissions { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class RolePermissionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
}
