import type { SalesChartPoint } from '@/features/dashboard/types'

export const DASHBOARD_SEED_DAILY_CHART: SalesChartPoint[] = [
  { label: 'Mon', sales: 38500, transactions: 18 },
  { label: 'Tue', sales: 42100, transactions: 22 },
  { label: 'Wed', sales: 39800, transactions: 19 },
  { label: 'Thu', sales: 45200, transactions: 24 },
  { label: 'Fri', sales: 51000, transactions: 28 },
  { label: 'Sat', sales: 47800, transactions: 26 },
  { label: 'Sun', sales: 45500, transactions: 21 },
]

export const DASHBOARD_SEED_WEEKLY_CHART: SalesChartPoint[] = [
  { label: 'Week 1', sales: 168000, transactions: 82 },
  { label: 'Week 2', sales: 182500, transactions: 91 },
  { label: 'Week 3', sales: 195000, transactions: 96 },
  { label: 'Week 4', sales: 210000, transactions: 104 },
]

export const DASHBOARD_SEED_MONTHLY_CHART: SalesChartPoint[] = [
  { label: 'Jan', sales: 620000, transactions: 310 },
  { label: 'Feb', sales: 680000, transactions: 335 },
  { label: 'Mar', sales: 710000, transactions: 348 },
  { label: 'Apr', sales: 760000, transactions: 372 },
  { label: 'May', sales: 810000, transactions: 398 },
  { label: 'Jun', sales: 850000, transactions: 415 },
]
