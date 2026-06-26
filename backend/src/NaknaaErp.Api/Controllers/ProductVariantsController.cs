using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.ProductVariants;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/products/{productId:guid}/variants")]
public class ProductVariantsController : ControllerBase
{
    private readonly IProductVariantService _productVariantService;

    public ProductVariantsController(IProductVariantService productVariantService)
    {
        _productVariantService = productVariantService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductVariantDto>>>> GetAll(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var result = await _productVariantService.GetByProductIdAsync(productId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ProductVariantDto>>.Ok(result));
    }

    [HttpGet("{variantId:guid}")]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> GetById(
        Guid productId,
        Guid variantId,
        CancellationToken cancellationToken)
    {
        var result = await _productVariantService.GetByIdAsync(productId, variantId, cancellationToken);
        return Ok(ApiResponse<ProductVariantDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> Create(
        Guid productId,
        [FromBody] CreateProductVariantRequest request,
        CancellationToken cancellationToken)
    {
        request.ProductId = productId;
        var result = await _productVariantService.CreateAsync(productId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { productId, variantId = result.Id },
            ApiResponse<ProductVariantDto>.Ok(result, "Product variant created successfully"));
    }

    [HttpPut("{variantId:guid}")]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> Update(
        Guid productId,
        Guid variantId,
        [FromBody] UpdateProductVariantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _productVariantService.UpdateAsync(productId, variantId, request, cancellationToken);
        return Ok(ApiResponse<ProductVariantDto>.Ok(result, "Product variant updated successfully"));
    }

    [HttpDelete("{variantId:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid productId,
        Guid variantId,
        CancellationToken cancellationToken)
    {
        await _productVariantService.DeleteAsync(productId, variantId, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Product variant deleted successfully"));
    }
}
