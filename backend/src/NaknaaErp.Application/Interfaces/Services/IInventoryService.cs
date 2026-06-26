using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Inventory;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IInventoryService
{
    Task<PagedResult<InventoryListItemDto>> GetAllAsync(InventoryListQuery query, CancellationToken cancellationToken = default);
    Task<InventoryDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<InventoryTransactionDto>> GetHistoryAsync(InventoryHistoryQuery query, CancellationToken cancellationToken = default);
    Task<InventoryTransactionDto> StockInAsync(StockInRequest request, CancellationToken cancellationToken = default);
    Task<InventoryTransactionDto> StockOutAsync(StockOutRequest request, CancellationToken cancellationToken = default);
    Task<InventoryTransactionDto> AdjustAsync(InventoryAdjustmentRequest request, CancellationToken cancellationToken = default);
    Task<ProductAvailabilitySearchResultDto> SearchAvailabilityAsync(string query, CancellationToken cancellationToken = default);
    Task<ProductAvailabilitySearchResultDto> LocateProductAsync(Guid productId, CancellationToken cancellationToken = default);
}
