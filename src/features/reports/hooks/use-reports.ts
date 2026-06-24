import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import type { ReportFilters } from '@/features/reports/types'
import { reportFilterDefaults, reportService } from '@/services/reports/reportService'

function reportQueryKey(scope: string, filters: ReportFilters) {
  return [QUERY_KEYS.REPORTS, scope, filters] as const
}

export function useReportFilterOptions() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'filters'],
    queryFn: () => reportService.getFilterOptions(),
  })
}

export function useReportsDashboard(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('dashboard', filters),
    queryFn: () => reportService.getReportsDashboard(filters),
    refetchOnWindowFocus: true,
  })
}

export function useSalesReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('sales', filters),
    queryFn: () => reportService.getSalesReport(filters),
  })
}

export function useInventoryReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('inventory', filters),
    queryFn: () => reportService.getInventoryReport(filters),
  })
}

export function usePurchaseReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('purchases', filters),
    queryFn: () => reportService.getPurchaseReport(filters),
  })
}

export function useWarehouseReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('warehouses', filters),
    queryFn: () => reportService.getWarehouseReport(filters),
  })
}

export function useCustomerReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('customers', filters),
    queryFn: () => reportService.getCustomerReport(filters),
  })
}

export function useSupplierReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('suppliers', filters),
    queryFn: () => reportService.getSupplierReport(filters),
  })
}

export function useServiceReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('services', filters),
    queryFn: () => reportService.getServiceReport(filters),
  })
}

export function useUserReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('users', filters),
    queryFn: () => reportService.getUserReport(filters),
  })
}

export function useProfitLossReport(filters: ReportFilters = reportFilterDefaults) {
  return useQuery({
    queryKey: reportQueryKey('profit-loss', filters),
    queryFn: () => reportService.getProfitLossReport(filters),
  })
}
