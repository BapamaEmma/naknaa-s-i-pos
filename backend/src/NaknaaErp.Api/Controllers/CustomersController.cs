using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Customers;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<CustomerListItemDto>>>> GetAll(
        [FromQuery] CustomerListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _customerService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<CustomerListItemDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<CustomerDashboardSummaryDto>>> GetSummary(
        CancellationToken cancellationToken)
    {
        var result = await _customerService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<CustomerDashboardSummaryDto>.Ok(result));
    }

    [HttpGet("options")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CustomerOptionDto>>>> GetOptions(
        CancellationToken cancellationToken)
    {
        var result = await _customerService.GetOptionsAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<CustomerOptionDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CustomerDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _customerService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<CustomerDetailDto>.Ok(result));
    }

    [HttpGet("{id:guid}/purchases")]
    public async Task<ActionResult<ApiResponse<CustomerPurchaseHistoryResultDto>>> GetPurchases(
        Guid id,
        [FromQuery] CustomerPurchaseQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _customerService.GetPurchaseHistoryAsync(id, query, cancellationToken);
        return Ok(ApiResponse<CustomerPurchaseHistoryResultDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CustomerDetailDto>>> Create(
        [FromBody] CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customerService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<CustomerDetailDto>.Ok(result, "Customer created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CustomerDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customerService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<CustomerDetailDto>.Ok(result, "Customer updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _customerService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Customer deleted successfully"));
    }
}
