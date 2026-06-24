export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface ReportFilters {
  dateFrom?: string
  dateTo?: string
  branchId?: string | 'all'
  warehouseId?: string | 'all'
  userId?: string | 'all'
  categoryId?: string | 'all'
  period?: ReportPeriod
}

export interface ReportMetric {
  label: string
  value: string
  helperText?: string
}

export interface ReportChartPoint {
  label: string
  value: number
  secondaryValue?: number
}

export interface ReportTableColumn<T> {
  key: keyof T | string
  header: string
  className?: string
  render?: (row: T) => import('react').ReactNode
}

export interface ReportsDashboardSummary {
  totalRevenue: number
  totalPurchases: number
  inventoryValue: number
  totalCustomers: number
  totalSuppliers: number
  totalServices: number
  monthlyProfit: number
  monthlyTransactions: number
  cards: ReportMetric[]
}

export interface SalesReportData {
  summary: {
    revenue: number
    quantitySold: number
    transactions: number
  }
  dailyTrend: ReportChartPoint[]
  monthlyTrend: ReportChartPoint[]
  byProduct: Array<{ name: string; quantity: number; revenue: number }>
  byCategory: Array<{ name: string; quantity: number; revenue: number }>
  byWarehouse: Array<{ name: string; quantity: number; revenue: number }>
  byPaymentMethod: Array<{ name: string; value: number; count: number }>
  byCashier: Array<{ name: string; transactions: number; revenue: number }>
  periodBreakdown: Array<{ label: string; revenue: number; transactions: number; quantity: number }>
}

export interface InventoryReportRow {
  productName: string
  categoryName: string
  quantity: number
  warehouseName: string
  inventoryValue: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface InventoryReportData {
  summary: {
    totalProducts: number
    totalQuantity: number
    inventoryValue: number
    lowStockCount: number
    outOfStockCount: number
  }
  currentInventory: InventoryReportRow[]
  stockMovement: Array<{ label: string; stockIn: number; stockOut: number }>
  valuationByCategory: ReportChartPoint[]
  lowStock: InventoryReportRow[]
  outOfStock: InventoryReportRow[]
  byWarehouse: Array<{ warehouseName: string; quantity: number; value: number; productCount: number }>
}

export interface PurchaseReportRow {
  supplierName: string
  productName: string
  quantityPurchased: number
  totalCost: number
  purchaseDate: string
}

export interface PurchaseReportData {
  summary: {
    totalPurchases: number
    totalCost: number
    totalQuantity: number
  }
  bySupplier: Array<{ supplierName: string; purchases: number; quantity: number; totalCost: number }>
  byWarehouse: Array<{ warehouseName: string; purchases: number; quantity: number; totalCost: number }>
  monthly: ReportChartPoint[]
  costAnalysis: Array<{ label: string; cost: number; share: number }>
  rows: PurchaseReportRow[]
}

export interface WarehouseReportRow {
  warehouseName: string
  stockQuantity: number
  inventoryValue: number
  productCount: number
}

export interface WarehouseReportData {
  summary: {
    totalStock: number
    totalValue: number
    totalProducts: number
    transfersThisMonth: number
  }
  stockReport: WarehouseReportRow[]
  transferReport: Array<{ label: string; transfers: number; quantity: number }>
  valueReport: ReportChartPoint[]
}

export interface CustomerReportRow {
  customerName: string
  purchases: number
  amountSpent: number
  lastPurchaseDate: string | null
  frequency: string
}

export interface CustomerReportData {
  summary: {
    totalCustomers: number
    activeCustomers: number
    averageSpend: number
    totalSpent: number
  }
  topCustomers: CustomerReportRow[]
  spendingAnalysis: ReportChartPoint[]
  frequencyAnalysis: Array<{ label: string; customers: number }>
  purchaseHistory: CustomerReportRow[]
}

export interface SupplierReportRow {
  supplierName: string
  totalPurchases: number
  totalQuantitySupplied: number
  lastSupplyDate: string | null
  performanceScore: number
}

export interface SupplierReportData {
  summary: {
    totalSuppliers: number
    activeSuppliers: number
    totalPurchaseValue: number
    totalQuantity: number
  }
  purchaseReport: SupplierReportRow[]
  topSuppliers: SupplierReportRow[]
  performance: ReportChartPoint[]
}

export interface ServiceReportRow {
  serviceName: string
  jobs: number
  revenue: number
  categoryName: string
}

export interface ServiceReportData {
  summary: {
    totalJobs: number
    completedJobs: number
    serviceRevenue: number
    averageJobValue: number
  }
  revenueReport: ReportChartPoint[]
  categoryReport: Array<{ categoryName: string; jobs: number; revenue: number }>
  technicianPerformance: Array<{ technician: string; jobs: number; revenue: number }>
  rows: ServiceReportRow[]
}

export interface UserReportRow {
  userName: string
  role: string
  actions: number
  lastLogin: string | null
  salesCount: number
  inventoryActions: number
}

export interface UserReportData {
  summary: {
    totalUsers: number
    activeUsers: number
    loginsThisMonth: number
    totalActions: number
  }
  loginReport: UserReportRow[]
  salesByUser: UserReportRow[]
  inventoryActions: UserReportRow[]
  activitySummary: UserReportRow[]
}

export interface ProfitLossReportData {
  totalRevenue: number
  purchaseCosts: number
  serviceCosts: number
  totalExpenses: number
  grossProfit: number
  netProfit: number
  revenueBreakdown: ReportChartPoint[]
  expenseBreakdown: ReportChartPoint[]
  monthlyTrend: ReportChartPoint[]
}
