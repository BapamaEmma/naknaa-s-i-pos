using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Purchases;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/purchases")]
public class PurchasesController : ControllerBase
{
    private readonly IPurchaseService _purchaseService;

    public PurchasesController(IPurchaseService purchaseService)
    {
        _purchaseService = purchaseService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<PurchaseListItemDto>>>> GetAll(
        [FromQuery] PurchaseListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<PurchaseListItemDto>>.Ok(result));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<PurchaseDashboardSummaryDto>>> GetDashboard(
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<PurchaseDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("reports")]
    public async Task<ActionResult<ApiResponse<PurchaseReportsDto>>> GetReports(
        [FromQuery] PurchaseReportQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.GetReportsAsync(query, cancellationToken);
        return Ok(ApiResponse<PurchaseReportsDto>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PurchaseDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<PurchaseDetailDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PurchaseDetailDto>>> Create(
        [FromBody] CreatePurchaseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<PurchaseDetailDto>.Ok(result, "Purchase created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PurchaseDetailDto>>> Update(
        Guid id,
        [FromBody] UpdatePurchaseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<PurchaseDetailDto>.Ok(result, "Purchase updated successfully"));
    }

    [HttpPost("receive")]
    public async Task<ActionResult<ApiResponse<PurchaseDetailDto>>> Receive(
        [FromBody] ReceivePurchaseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _purchaseService.ReceiveAsync(request, cancellationToken);
        return Ok(ApiResponse<PurchaseDetailDto>.Ok(result, "Purchase received successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _purchaseService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Purchase deleted successfully"));
    }
}
