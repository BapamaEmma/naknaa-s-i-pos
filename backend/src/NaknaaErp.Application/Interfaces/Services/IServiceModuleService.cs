using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Services;
using NaknaaErp.Application.DTOs.ServiceJobs;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IServiceModuleService
{
    Task<PagedResult<ServiceListItemDto>> GetAllServicesAsync(ServiceListQuery query, CancellationToken cancellationToken = default);
    Task<ServiceDetailDto> GetServiceByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceDetailDto> CreateServiceAsync(CreateServiceRequest request, CancellationToken cancellationToken = default);
    Task<ServiceDetailDto> UpdateServiceAsync(Guid id, UpdateServiceRequest request, CancellationToken cancellationToken = default);
    Task DeleteServiceAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<ServiceJobListItemDto>> GetAllJobsAsync(ServiceJobListQuery query, CancellationToken cancellationToken = default);
    Task<ServiceJobDetailDto> GetJobByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceJobDetailDto> CreateJobAsync(CreateServiceJobRequest request, CancellationToken cancellationToken = default);
    Task<ServiceJobDetailDto> UpdateJobAsync(Guid id, UpdateServiceJobRequest request, CancellationToken cancellationToken = default);
    Task<ServiceJobReceiptDto> GetJobReceiptAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
}
