export const DASHBOARD_API_ENDPOINTS = {
  OVERVIEW: '/dashboard',
} as const

export const KPI_ICONS: Record<string, string> = {
  todaySales: 'banknote',
  weeklyRevenue: 'calendar-days',
  monthlyRevenue: 'trending-up',
  todayTransactions: 'receipt',
  totalCustomers: 'users',
  totalProducts: 'package',
  inventoryValue: 'warehouse',
  lowStockProducts: 'alert-triangle',
}

export const PAYMENT_CHART_COLORS = {
  cash: '#16a34a',
  mobile_money: '#2563eb',
} as const
