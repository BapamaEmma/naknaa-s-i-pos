import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/api'
import { dashboardService } from '@/services/dashboard/dashboardService'

export function useDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: () => dashboardService.getDashboardData(),
  })
}
