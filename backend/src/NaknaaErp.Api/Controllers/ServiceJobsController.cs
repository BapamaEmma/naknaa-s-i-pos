using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.ServiceJobs;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/service-jobs")]
public class ServiceJobsController : ControllerBase
{
    private readonly IServiceModuleService _serviceModuleService;

    public ServiceJobsController(IServiceModuleService serviceModuleService)
    {
        _serviceModuleService = serviceModuleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ServiceJobListItemDto>>>> GetAll(
        [FromQuery] ServiceJobListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.GetAllJobsAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<ServiceJobListItemDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceJobDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.GetJobByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<ServiceJobDetailDto>.Ok(result));
    }

    [HttpGet("{id:guid}/receipt")]
    public async Task<ActionResult<ApiResponse<ServiceJobReceiptDto>>> GetReceipt(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.GetJobReceiptAsync(id, cancellationToken);
        return Ok(ApiResponse<ServiceJobReceiptDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ServiceJobDetailDto>>> Create(
        [FromBody] CreateServiceJobRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.CreateJobAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<ServiceJobDetailDto>.Ok(result, "Service job created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceJobDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateServiceJobRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _serviceModuleService.UpdateJobAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ServiceJobDetailDto>.Ok(result, "Service job updated successfully"));
    }
}
