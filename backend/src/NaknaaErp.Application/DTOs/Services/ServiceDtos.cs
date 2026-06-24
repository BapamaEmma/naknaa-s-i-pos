namespace NaknaaErp.Application.DTOs.Services;

public class CreateServiceRequest
{
    public string ServiceName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateServiceRequest : CreateServiceRequest
{
}

public class ServiceListQuery
{
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ServiceListItemDto
{
    public Guid Id { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ServiceDetailDto : ServiceListItemDto
{
    public DateTime? UpdatedAt { get; set; }
}

public class ServiceDashboardSummaryDto
{
    public int TotalServices { get; set; }
    public int CompletedJobs { get; set; }
    public int PendingJobs { get; set; }
    public decimal ServiceRevenue { get; set; }
}
