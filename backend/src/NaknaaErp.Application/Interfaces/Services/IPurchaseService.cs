using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Purchases;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IPurchaseService
{
    Task<PagedResult<PurchaseListItemDto>> GetAllAsync(PurchaseListQuery query, CancellationToken cancellationToken = default);
    Task<PurchaseDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PurchaseDetailDto> CreateAsync(CreatePurchaseRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseDetailDto> UpdateAsync(Guid id, UpdatePurchaseRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseDetailDto> ReceiveAsync(ReceivePurchaseRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PurchaseDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<PurchaseReportsDto> GetReportsAsync(PurchaseReportQuery query, CancellationToken cancellationToken = default);
}
