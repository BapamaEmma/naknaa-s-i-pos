using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Suppliers;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/suppliers")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<SupplierListItemDto>>>> GetAll(
        [FromQuery] SupplierListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetAllAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<SupplierListItemDto>>.Ok(result));
    }

    [HttpGet("options")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SupplierOptionDto>>>> GetOptions(
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetOptionsAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<SupplierOptionDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SupplierDetailDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<SupplierDetailDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SupplierDetailDto>>> Create(
        [FromBody] CreateSupplierRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<SupplierDetailDto>.Ok(result, "Supplier created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SupplierDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateSupplierRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<SupplierDetailDto>.Ok(result, "Supplier updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _supplierService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Supplier deleted successfully"));
    }
}
