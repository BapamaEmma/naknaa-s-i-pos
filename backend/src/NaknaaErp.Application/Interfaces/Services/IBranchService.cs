using NaknaaErp.Application.DTOs.Settings;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IBranchService
{
    Task<IReadOnlyList<SettingsBranchDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SettingsBranchDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SettingsBranchDto> CreateAsync(CreateBranchRequest request, CancellationToken cancellationToken = default);
    Task<SettingsBranchDto> UpdateAsync(Guid id, UpdateBranchRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
