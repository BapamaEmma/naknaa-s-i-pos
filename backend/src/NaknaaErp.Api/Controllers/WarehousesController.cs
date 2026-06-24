using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Warehouses;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/warehouses")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<WarehouseListItemDto>>>> GetAll(
        [FromQuery] WarehouseListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<WarehouseListItemDto>>.Ok(result));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<WarehouseDashboardSummaryDto>>> GetDashboard(
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<WarehouseDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("transfers")]
    public async Task<ActionResult<ApiResponse<PagedResult<WarehouseTransferDto>>>> GetTransfers(
        [FromQuery] TransferListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.GetTransfersAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<WarehouseTransferDto>>.Ok(result));
    }

    [HttpPost("transfers")]
    public async Task<ActionResult<ApiResponse<WarehouseTransferDto>>> CreateTransfer(
        [FromBody] CreateTransferRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.CreateTransferAsync(request, cancellationToken);
        return Ok(ApiResponse<WarehouseTransferDto>.Ok(result, "Transfer created successfully"));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<WarehouseDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<WarehouseDetailDto>.Ok(result));
    }

    [HttpGet("{id:guid}/inventory")]
    public async Task<ActionResult<ApiResponse<PagedResult<WarehouseStockRecordDto>>>> GetInventory(
        Guid id,
        [FromQuery] InventoryLocationQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.GetInventoryAsync(id, query, cancellationToken);
        return Ok(ApiResponse<PagedResult<WarehouseStockRecordDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WarehouseDetailDto>>> Create(
        [FromBody] CreateWarehouseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<WarehouseDetailDto>.Ok(result, "Warehouse created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<WarehouseDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateWarehouseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _warehouseService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<WarehouseDetailDto>.Ok(result, "Warehouse updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _warehouseService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Warehouse deleted successfully"));
    }
}
