using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Products;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IProductService
{
    Task<PagedResult<ProductListItemDto>> GetAllAsync(ProductListQuery query, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BrandOptionDto>> GetBrandsAsync(CancellationToken cancellationToken = default);
}
