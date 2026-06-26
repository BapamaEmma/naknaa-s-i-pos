using NaknaaErp.Application.DTOs.Reports;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IReportService
{
    Task<ReportsDashboardSummaryDto> GetDashboardSummaryAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<SalesReportDataDto> GetSalesReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<InventoryReportDataDto> GetInventoryReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<PurchaseReportDataDto> GetPurchaseReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<WarehouseReportDataDto> GetWarehouseReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<CustomerReportDataDto> GetCustomerReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<SupplierReportDataDto> GetSupplierReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<ServiceReportDataDto> GetServiceReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<UserReportDataDto> GetUserReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
    Task<ProfitLossReportDataDto> GetProfitLossReportAsync(ReportFiltersDto filters, CancellationToken cancellationToken = default);
}
