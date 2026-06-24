using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Sales;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/sales")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<SaleListItemDto>>>> GetAll(
        [FromQuery] SaleListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _saleService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<SaleListItemDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<SalesDashboardSummaryDto>>> GetSummary(
        CancellationToken cancellationToken)
    {
        var result = await _saleService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<SalesDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("products")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PosProductResultDto>>>> SearchProducts(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        var result = await _saleService.SearchProductsAsync(query, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<PosProductResultDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SaleDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _saleService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<SaleDetailDto>.Ok(result));
    }

    [HttpGet("{id:guid}/receipt")]
    public async Task<ActionResult<ApiResponse<ReceiptDataDto>>> GetReceipt(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _saleService.GetReceiptAsync(id, cancellationToken);
        return Ok(ApiResponse<ReceiptDataDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SaleDetailDto>>> Create(
        [FromBody] CreateSaleRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _saleService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<SaleDetailDto>.Ok(result, "Sale completed successfully"));
    }

    [HttpPost("{id:guid}/void")]
    public async Task<ActionResult<ApiResponse<object>>> Void(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _saleService.VoidAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Sale voided successfully"));
    }
}
