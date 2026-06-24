import type {
  BranchPerformance,
  DashboardData,
  DashboardKpi,
  DashboardLowStockItem,
  DashboardNotification,
  DashboardRecentSale,
  InventoryOverview,
  PaymentMethodSlice,
  SalesChartPeriod,
  SalesChartPoint,
  TopSellingProduct,
  TrendDirection,
} from '@/features/dashboard/types'
import type { PaymentMethod } from '@/features/sales/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiGet } from '@/services/api/http'
import { fromPaymentMethod } from '@/services/api/mappers'

const KPI_ICONS: Record<string, string> = {
  'today-sales': 'banknote',
  'weekly-revenue': 'calendar-range',
  'monthly-revenue': 'trending-up',
  'today-transactions': 'receipt',
  'total-customers': 'users',
  'total-products': 'package',
  'inventory-value': 'warehouse',
  'low-stock': 'alert-triangle',
}

function mapTrend(value: unknown): TrendDirection {
  const normalized = String(value ?? 'neutral').toLowerCase()
  if (normalized === 'up') return 'up'
  if (normalized === 'down') return 'down'
  return 'neutral'
}

function mapKpi(dto: Record<string, unknown>): DashboardKpi {
  const id = String(dto.id ?? '')
  const format = String(dto.format ?? 'number') === 'currency' ? 'currency' : 'number'

  return {
    id,
    title: String(dto.title ?? ''),
    value: Number(dto.value ?? 0),
    formattedValue: String(dto.formattedValue ?? dto.value ?? ''),
    changePercent: Number(dto.changePercent ?? 0),
    trend: mapTrend(dto.trend),
    icon: KPI_ICONS[id] ?? 'activity',
    format,
  }
}

function mapSalesChartPoint(dto: Record<string, unknown>): SalesChartPoint {
  return {
    label: String(dto.label ?? ''),
    sales: Number(dto.sales ?? 0),
    transactions: Number(dto.transactions ?? 0),
  }
}

function mapPaymentMethodSlice(dto: Record<string, unknown>): PaymentMethodSlice {
  const methodValue = dto.method
  const method: PaymentMethod =
    typeof methodValue === 'number' || typeof methodValue === 'string'
      ? fromPaymentMethod(methodValue)
      : 'cash'

  return {
    method,
    label: String(dto.label ?? (method === 'mobile_money' ? 'Mobile Money' : 'Cash')),
    value: Number(dto.value ?? 0),
    percentage: Number(dto.percentage ?? 0),
  }
}

function mapTopSellingProduct(dto: Record<string, unknown>): TopSellingProduct {
  return {
    id: String(dto.id ?? crypto.randomUUID()),
    productName: String(dto.productName ?? ''),
    variantName: String(dto.variantName ?? ''),
    unitsSold: Number(dto.unitsSold ?? 0),
    revenue: Number(dto.revenue ?? 0),
  }
}

function mapLowStockItem(dto: Record<string, unknown>): DashboardLowStockItem {
  return {
    id: String(dto.id),
    productName: String(dto.productName ?? ''),
    variantName: String(dto.variantName ?? ''),
    currentStock: Number(dto.currentStock ?? 0),
    minimumStock: Number(dto.minimumStock ?? 0),
    isCritical: Boolean(dto.isCritical ?? false),
  }
}

function mapRecentSale(dto: Record<string, unknown>): DashboardRecentSale {
  const methodValue = dto.paymentMethod
  return {
    id: String(dto.id),
    receiptNumber: String(dto.receiptNumber ?? ''),
    customerName: String(dto.customerName ?? 'Walk-In Customer'),
    amount: Number(dto.amount ?? 0),
    paymentMethod:
      typeof methodValue === 'number' || typeof methodValue === 'string'
        ? fromPaymentMethod(methodValue)
        : 'cash',
    saleDate: String(dto.saleDate ?? new Date().toISOString()),
  }
}

function mapBranchPerformance(dto: Record<string, unknown>): BranchPerformance {
  return {
    branchId: String(dto.branchId),
    branchName: String(dto.branchName ?? ''),
    salesAmount: Number(dto.salesAmount ?? 0),
    transactions: Number(dto.transactions ?? 0),
  }
}

function mapInventoryOverview(dto: Record<string, unknown>): InventoryOverview {
  return {
    totalInventoryValue: Number(dto.totalInventoryValue ?? 0),
    totalStockQuantity: Number(dto.totalStockQuantity ?? 0),
    lowStockCount: Number(dto.lowStockCount ?? 0),
    outOfStockCount: Number(dto.outOfStockCount ?? 0),
  }
}

function mapNotification(dto: Record<string, unknown>): DashboardNotification {
  const typeValue = String(dto.type ?? 'system').toLowerCase()
  const type: DashboardNotification['type'] =
    typeValue === 'low_stock' ||
    typeValue === 'activity' ||
    typeValue === 'adjustment' ||
    typeValue === 'system'
      ? typeValue
      : 'system'

  return {
    id: String(dto.id),
    type,
    title: String(dto.title ?? ''),
    message: String(dto.message ?? ''),
    timestamp: String(dto.timestamp ?? new Date().toISOString()),
  }
}

async function fetchSalesChart(period: SalesChartPeriod): Promise<SalesChartPoint[]> {
  const periodParam = period.charAt(0).toUpperCase() + period.slice(1)

  try {
    const result = await apiGet<Record<string, unknown>[]>(`${API_ENDPOINTS.dashboard}/sales-chart`, {
      params: { period: periodParam },
    })
    return result.map((item) => mapSalesChartPoint(item))
  } catch {
    return []
  }
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const dashboard = await apiGet<Record<string, unknown>>(API_ENDPOINTS.dashboard)
    const dailyFromDashboard = Array.isArray(dashboard.salesChart)
      ? dashboard.salesChart.map((item) => mapSalesChartPoint(item as Record<string, unknown>))
      : []

    const [dailyChart, weeklyChart, monthlyChart] = await Promise.all([
      dailyFromDashboard.length > 0 ? Promise.resolve(dailyFromDashboard) : fetchSalesChart('daily'),
      fetchSalesChart('weekly'),
      fetchSalesChart('monthly'),
    ])

    const inventoryOverview = (dashboard.inventoryOverview as Record<string, unknown>) ?? {}

    return {
      kpis: Array.isArray(dashboard.kpis)
        ? dashboard.kpis.map((item) => mapKpi(item as Record<string, unknown>))
        : [],
      salesChart: {
        daily: dailyChart,
        weekly: weeklyChart,
        monthly: monthlyChart,
      },
      paymentMethods: Array.isArray(dashboard.paymentMethods)
        ? dashboard.paymentMethods.map((item) =>
            mapPaymentMethodSlice(item as Record<string, unknown>),
          )
        : [],
      topProducts: Array.isArray(dashboard.topProducts)
        ? dashboard.topProducts.map((item) =>
            mapTopSellingProduct(item as Record<string, unknown>),
          )
        : [],
      lowStockItems: Array.isArray(dashboard.lowStockItems)
        ? dashboard.lowStockItems.map((item) => mapLowStockItem(item as Record<string, unknown>))
        : [],
      recentSales: Array.isArray(dashboard.recentSales)
        ? dashboard.recentSales.map((item) => mapRecentSale(item as Record<string, unknown>))
        : [],
      branchPerformance: Array.isArray(dashboard.branchPerformance)
        ? dashboard.branchPerformance.map((item) =>
            mapBranchPerformance(item as Record<string, unknown>),
          )
        : [],
      inventoryOverview: mapInventoryOverview(inventoryOverview),
      notifications: Array.isArray(dashboard.notifications)
        ? dashboard.notifications.map((item) => mapNotification(item as Record<string, unknown>))
        : [],
    }
  },
}
