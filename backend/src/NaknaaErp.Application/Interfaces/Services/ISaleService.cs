using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Sales;

namespace NaknaaErp.Application.Interfaces.Services;

public interface ISaleService
{
    Task<PagedResult<SaleListItemDto>> GetAllAsync(SaleListQuery query, CancellationToken cancellationToken = default);
    Task<SaleDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SaleDetailDto> CreateAsync(CreateSaleRequest request, CancellationToken cancellationToken = default);
    Task VoidAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ReceiptDataDto> GetReceiptAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SalesDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PosProductResultDto>> SearchProductsAsync(string query, CancellationToken cancellationToken = default);
}
