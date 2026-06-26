using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Settings;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/branches")]
public class BranchesController : ControllerBase
{
    private readonly IBranchService _branchService;

    public BranchesController(IBranchService branchService)
    {
        _branchService = branchService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SettingsBranchDto>>>> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _branchService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<SettingsBranchDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SettingsBranchDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _branchService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<SettingsBranchDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SettingsBranchDto>>> Create(
        [FromBody] CreateBranchRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _branchService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<SettingsBranchDto>.Ok(result, "Branch created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SettingsBranchDto>>> Update(
        Guid id,
        [FromBody] UpdateBranchRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _branchService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<SettingsBranchDto>.Ok(result, "Branch updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _branchService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Branch deleted successfully"));
    }
}
