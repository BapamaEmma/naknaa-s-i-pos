import type { PaymentMethod } from '@/features/sales/types'

export type TrendDirection = 'up' | 'down' | 'neutral'

export type SalesChartPeriod = 'daily' | 'weekly' | 'monthly'

export interface DashboardKpi {
  id: string
  title: string
  value: number
  formattedValue: string
  changePercent: number
  trend: TrendDirection
  icon: string
  format: 'currency' | 'number'
}

export interface SalesChartPoint {
  label: string
  sales: number
  transactions: number
}

export interface PaymentMethodSlice {
  method: PaymentMethod
  label: string
  value: number
  percentage: number
}

export interface TopSellingProduct {
  id: string
  productName: string
  variantName: string
  unitsSold: number
  revenue: number
}

export interface DashboardLowStockItem {
  id: string
  productName: string
  variantName: string
  currentStock: number
  minimumStock: number
  isCritical: boolean
}

export interface DashboardRecentSale {
  id: string
  receiptNumber: string
  customerName: string
  amount: number
  paymentMethod: PaymentMethod
  saleDate: string
}

export interface BranchPerformance {
  branchId: string
  branchName: string
  salesAmount: number
  transactions: number
}

export interface InventoryOverview {
  totalInventoryValue: number
  totalStockQuantity: number
  lowStockCount: number
  outOfStockCount: number
}

export interface DashboardNotification {
  id: string
  type: 'low_stock' | 'activity' | 'adjustment' | 'system'
  title: string
  message: string
  timestamp: string
}

export interface DashboardData {
  kpis: DashboardKpi[]
  salesChart: Record<SalesChartPeriod, SalesChartPoint[]>
  paymentMethods: PaymentMethodSlice[]
  topProducts: TopSellingProduct[]
  lowStockItems: DashboardLowStockItem[]
  recentSales: DashboardRecentSale[]
  branchPerformance: BranchPerformance[]
  inventoryOverview: InventoryOverview
  notifications: DashboardNotification[]
}
