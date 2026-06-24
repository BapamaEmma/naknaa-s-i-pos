namespace NaknaaErp.Application.DTOs.AuditLogs;

public class AuditLogListQuery
{
    public string? Search { get; set; }
    public Guid? UserId { get; set; }
    public Guid? BranchId { get; set; }
    public string? Entity { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class CreateAuditLogRequest
{
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public Guid? BranchId { get; set; }
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public Guid? BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; }
}
