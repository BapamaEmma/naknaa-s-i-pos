using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Warehouses;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IWarehouseService
{
    Task<PagedResult<WarehouseListItemDto>> GetAllAsync(WarehouseListQuery query, CancellationToken cancellationToken = default);
    Task<WarehouseDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WarehouseDetailDto> CreateAsync(CreateWarehouseRequest request, CancellationToken cancellationToken = default);
    Task<WarehouseDetailDto> UpdateAsync(Guid id, UpdateWarehouseRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WarehouseDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<WarehouseStockRecordDto>> GetInventoryAsync(Guid warehouseId, InventoryLocationQuery query, CancellationToken cancellationToken = default);
    Task<PagedResult<WarehouseTransferDto>> GetTransfersAsync(TransferListQuery query, CancellationToken cancellationToken = default);
    Task<WarehouseTransferDto> CreateTransferAsync(CreateTransferRequest request, CancellationToken cancellationToken = default);
}
