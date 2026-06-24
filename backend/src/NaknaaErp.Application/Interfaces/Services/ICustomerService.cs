using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Customers;

namespace NaknaaErp.Application.Interfaces.Services;

public interface ICustomerService
{
    Task<PagedResult<CustomerListItemDto>> GetAllAsync(CustomerListQuery query, CancellationToken cancellationToken = default);
    Task<CustomerDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CustomerDetailDto> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<CustomerDetailDto> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CustomerDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<CustomerPurchaseHistoryResultDto> GetPurchaseHistoryAsync(Guid id, CustomerPurchaseQuery query, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerOptionDto>> GetOptionsAsync(CancellationToken cancellationToken = default);
}
