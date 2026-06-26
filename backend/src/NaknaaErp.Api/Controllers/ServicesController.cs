using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Services;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceModuleService _serviceModuleService;

    public ServicesController(IServiceModuleService serviceModuleService)
    {
        _serviceModuleService = serviceModuleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ServiceListItemDto>>>> GetAll(
        [FromQuery] ServiceListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.GetAllServicesAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<ServiceListItemDto>>.Ok(result));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<ServiceDashboardSummaryDto>>> GetDashboard(
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<ServiceDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.GetServiceByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<ServiceDetailDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ServiceDetailDto>>> Create(
        [FromBody] CreateServiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.CreateServiceAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<ServiceDetailDto>.Ok(result, "Service created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateServiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.UpdateServiceAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ServiceDetailDto>.Ok(result, "Service updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _serviceModuleService.DeleteServiceAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Service deleted successfully"));
    }
}
