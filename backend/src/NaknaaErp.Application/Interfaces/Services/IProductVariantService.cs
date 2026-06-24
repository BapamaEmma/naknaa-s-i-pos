using NaknaaErp.Application.DTOs.ProductVariants;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IProductVariantService
{
    Task<IReadOnlyList<ProductVariantDto>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<ProductVariantDto> GetByIdAsync(Guid productId, Guid variantId, CancellationToken cancellationToken = default);
    Task<ProductVariantDto> CreateAsync(Guid productId, CreateProductVariantRequest request, CancellationToken cancellationToken = default);
    Task<ProductVariantDto> UpdateAsync(Guid productId, Guid variantId, UpdateProductVariantRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid productId, Guid variantId, CancellationToken cancellationToken = default);
}
