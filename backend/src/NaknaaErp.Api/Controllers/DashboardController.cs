using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Dashboard;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardDataDto>>> GetDashboard(
        [FromQuery] Guid? branchId,
        CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetDashboardDataAsync(branchId, cancellationToken);
        return Ok(ApiResponse<DashboardDataDto>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetSummary(
        CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetSummaryAsync(cancellationToken);
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(result));
    }

    [HttpGet("sales-chart")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SalesChartPointDto>>>> GetSalesChart(
        [FromQuery] SalesChartPeriod period = SalesChartPeriod.Daily,
        [FromQuery] Guid? branchId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _dashboardService.GetSalesChartAsync(period, branchId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<SalesChartPointDto>>.Ok(result));
    }
}
