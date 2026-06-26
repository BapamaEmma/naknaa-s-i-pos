using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Suppliers;

namespace NaknaaErp.Application.Interfaces.Services;

public interface ISupplierService
{
    Task<PagedResult<SupplierListItemDto>> GetAllAsync(SupplierListQuery query, CancellationToken cancellationToken = default);
    Task<SupplierDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SupplierDetailDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDetailDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SupplierOptionDto>> GetOptionsAsync(CancellationToken cancellationToken = default);
}
