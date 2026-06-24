using NaknaaErp.Application.DTOs.Dashboard;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<DashboardDataDto> GetDashboardDataAsync(Guid? branchId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesChartPointDto>> GetSalesChartAsync(SalesChartPeriod period, Guid? branchId = null, CancellationToken cancellationToken = default);
}

public enum SalesChartPeriod
{
    Daily,
    Weekly,
    Monthly
}
