using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Inventory;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/inventory")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<InventoryListItemDto>>>> GetAll(
        [FromQuery] InventoryListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<InventoryListItemDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<InventoryDashboardSummaryDto>>> GetSummary(
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<InventoryDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<PagedResult<InventoryTransactionDto>>>> GetHistory(
        [FromQuery] InventoryHistoryQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetHistoryAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<InventoryTransactionDto>>.Ok(result));
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<PagedResult<InventoryListItemDto>>>> GetLowStock(
        [FromQuery] InventoryListQuery query,
        CancellationToken cancellationToken)
    {
        query.Status = "low_stock";
        var result = await _inventoryService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<InventoryListItemDto>>.Ok(result));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<ProductAvailabilitySearchResultDto>>> SearchAvailability(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.SearchAvailabilityAsync(query, cancellationToken);
        return Ok(ApiResponse<ProductAvailabilitySearchResultDto>.Ok(result));
    }

    [HttpGet("locate/{productId:guid}")]
    public async Task<ActionResult<ApiResponse<ProductAvailabilitySearchResultDto>>> LocateProduct(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.LocateProductAsync(productId, cancellationToken);
        return Ok(ApiResponse<ProductAvailabilitySearchResultDto>.Ok(result));
    }

    [HttpPost("stock-in")]
    public async Task<ActionResult<ApiResponse<InventoryTransactionDto>>> StockIn(
        [FromBody] StockInRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.StockInAsync(request, cancellationToken);
        return Ok(ApiResponse<InventoryTransactionDto>.Ok(result, "Stock in recorded successfully"));
    }

    [HttpPost("stock-out")]
    public async Task<ActionResult<ApiResponse<InventoryTransactionDto>>> StockOut(
        [FromBody] StockOutRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.StockOutAsync(request, cancellationToken);
        return Ok(ApiResponse<InventoryTransactionDto>.Ok(result, "Stock out recorded successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<InventoryTransactionDto>>> Create(
        [FromBody] StockInRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.StockInAsync(request, cancellationToken);
        return Ok(ApiResponse<InventoryTransactionDto>.Ok(result, "Inventory record created successfully"));
    }

    [HttpPut("adjustment")]
    public async Task<ActionResult<ApiResponse<InventoryTransactionDto>>> Adjust(
        [FromBody] InventoryAdjustmentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.AdjustAsync(request, cancellationToken);
        return Ok(ApiResponse<InventoryTransactionDto>.Ok(result, "Inventory adjusted successfully"));
    }
}
