using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Application.DTOs.ServiceJobs;

public class CreateServiceJobRequest
{
    public Guid ServiceId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? AssignedUserId { get; set; }
    public decimal Price { get; set; }
    public string? Notes { get; set; }
}

public class UpdateServiceJobRequest
{
    public Guid ServiceId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? AssignedUserId { get; set; }
    public ServiceJobStatus Status { get; set; }
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ServiceJobListQuery
{
    public string? Search { get; set; }
    public ServiceJobStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ServiceJobListItemDto
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string? AssignedUserName { get; set; }
    public ServiceJobStatus Status { get; set; }
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ServiceJobDetailDto : ServiceJobListItemDto
{
    public string ServiceCode { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ServiceJobReceiptDto
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public ServiceJobStatus Status { get; set; }
    public string? AssignedUserName { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
}
