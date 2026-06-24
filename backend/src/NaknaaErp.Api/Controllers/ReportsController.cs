using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Reports;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<ReportsDashboardSummaryDto>>> GetDashboard(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetDashboardSummaryAsync(filters, cancellationToken);
        return Ok(ApiResponse<ReportsDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("sales")]
    public async Task<ActionResult<ApiResponse<SalesReportDataDto>>> GetSales(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetSalesReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<SalesReportDataDto>.Ok(result));
    }

    [HttpGet("inventory")]
    public async Task<ActionResult<ApiResponse<InventoryReportDataDto>>> GetInventory(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetInventoryReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<InventoryReportDataDto>.Ok(result));
    }

    [HttpGet("purchases")]
    public async Task<ActionResult<ApiResponse<PurchaseReportDataDto>>> GetPurchases(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetPurchaseReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<PurchaseReportDataDto>.Ok(result));
    }

    [HttpGet("warehouses")]
    public async Task<ActionResult<ApiResponse<WarehouseReportDataDto>>> GetWarehouses(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetWarehouseReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<WarehouseReportDataDto>.Ok(result));
    }

    [HttpGet("customers")]
    public async Task<ActionResult<ApiResponse<CustomerReportDataDto>>> GetCustomers(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetCustomerReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<CustomerReportDataDto>.Ok(result));
    }

    [HttpGet("suppliers")]
    public async Task<ActionResult<ApiResponse<SupplierReportDataDto>>> GetSuppliers(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetSupplierReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<SupplierReportDataDto>.Ok(result));
    }

    [HttpGet("services")]
    public async Task<ActionResult<ApiResponse<ServiceReportDataDto>>> GetServices(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetServiceReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<ServiceReportDataDto>.Ok(result));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<UserReportDataDto>>> GetUsers(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetUserReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<UserReportDataDto>.Ok(result));
    }

    [HttpGet("profit-loss")]
    public async Task<ActionResult<ApiResponse<ProfitLossReportDataDto>>> GetProfitLoss(
        [FromQuery] ReportFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetProfitLossReportAsync(filters, cancellationToken);
        return Ok(ApiResponse<ProfitLossReportDataDto>.Ok(result));
    }
}
