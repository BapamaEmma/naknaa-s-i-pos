import type { SalesChartPoint } from '@/features/dashboard/types'

export const DASHBOARD_SEED_DAILY_CHART: SalesChartPoint[] = [
  { label: 'Mon', sales: 38500, purchases: 24000, transactions: 18 },
  { label: 'Tue', sales: 42100, purchases: 26000, transactions: 22 },
  { label: 'Wed', sales: 39800, purchases: 25000, transactions: 19 },
  { label: 'Thu', sales: 45200, purchases: 28000, transactions: 24 },
  { label: 'Fri', sales: 51000, purchases: 31000, transactions: 28 },
  { label: 'Sat', sales: 47800, purchases: 29000, transactions: 26 },
  { label: 'Sun', sales: 45500, purchases: 27000, transactions: 21 },
]

export const DASHBOARD_SEED_WEEKLY_CHART: SalesChartPoint[] = [
  { label: 'Week 1', sales: 168000, purchases: 102000, transactions: 82 },
  { label: 'Week 2', sales: 182500, purchases: 110000, transactions: 91 },
  { label: 'Week 3', sales: 195000, purchases: 118000, transactions: 96 },
  { label: 'Week 4', sales: 210000, purchases: 126000, transactions: 104 },
]

export const DASHBOARD_SEED_MONTHLY_CHART: SalesChartPoint[] = [
  { label: 'Jan', sales: 620000, purchases: 380000, transactions: 310 },
  { label: 'Feb', sales: 680000, purchases: 410000, transactions: 335 },
  { label: 'Mar', sales: 710000, purchases: 430000, transactions: 348 },
  { label: 'Apr', sales: 760000, purchases: 460000, transactions: 372 },
  { label: 'May', sales: 810000, purchases: 490000, transactions: 398 },
  { label: 'Jun', sales: 850000, purchases: 510000, transactions: 415 },
]
