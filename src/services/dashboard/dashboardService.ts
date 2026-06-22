import type {
  BranchPerformance,
  DashboardData,
  DashboardKpi,
  DashboardLowStockItem,
  DashboardNotification,
  DashboardRecentSale,
  InventoryOverview,
  PaymentMethodSlice,
  TopSellingProduct,
  TrendDirection,
} from '@/features/dashboard/types'
import type { PaymentMethod } from '@/features/sales/types'
import { CUSTOMERS_STORAGE_KEY, SEED_CUSTOMERS } from '@/services/customers/mock-data'
import {
  DASHBOARD_SEED_DAILY_CHART,
  DASHBOARD_SEED_MONTHLY_CHART,
  DASHBOARD_SEED_WEEKLY_CHART,
} from '@/services/dashboard/mock-data'
import { BRANCHES_STORAGE_KEY, INVENTORY_STORAGE_KEY, INVENTORY_TRANSACTIONS_KEY, SEED_BRANCHES, SEED_INVENTORY, SEED_TRANSACTIONS } from '@/services/inventory/mock-data'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage } from '@/services/products/storage'
import { SALE_ITEMS_STORAGE_KEY, SALES_STORAGE_KEY, SEED_SALE_ITEMS, SEED_SALES } from '@/services/sales/mock-data'
import type { InventoryTransaction } from '@/features/inventory/types'
import type { Sale, SaleItem } from '@/features/sales/types'
import type { Customer } from '@/features/customers/types'
import type { ProductVariant } from '@/features/products/types'

function loadSales(): Sale[] {
  return readStorage(SALES_STORAGE_KEY, SEED_SALES)
}

function loadSaleItems(): SaleItem[] {
  return readStorage(SALE_ITEMS_STORAGE_KEY, SEED_SALE_ITEMS)
}

function loadCustomers(): Customer[] {
  return readStorage(CUSTOMERS_STORAGE_KEY, SEED_CUSTOMERS)
}

function loadProducts() {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants(): ProductVariant[] {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function loadInventory() {
  return readStorage(INVENTORY_STORAGE_KEY, SEED_INVENTORY)
}

function loadBranches() {
  return readStorage(BRANCHES_STORAGE_KEY, SEED_BRANCHES)
}

function loadTransactions(): InventoryTransaction[] {
  return readStorage(INVENTORY_TRANSACTIONS_KEY, SEED_TRANSACTIONS)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GH').format(value)
}

function calcTrend(current: number, previous: number): { changePercent: number; trend: TrendDirection } {
  if (previous === 0) {
    return { changePercent: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' }
  }
  const changePercent = ((current - previous) / previous) * 100
  return {
    changePercent: Math.round(changePercent * 10) / 10,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
  }
}

function getCompletedSales(): Sale[] {
  return loadSales().filter((sale) => sale.status === 'completed')
}

function sumSalesAmount(sales: Sale[]): number {
  return sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
}

function buildKpis(): DashboardKpi[] {
  const sales = getCompletedSales()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfDay)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
  const startOfLastWeek = new Date(startOfWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const todaySales = sales.filter((sale) => new Date(sale.saleDate) >= startOfDay)
  const yesterdaySales = sales.filter((sale) => {
    const date = new Date(sale.saleDate)
    return date >= startOfYesterday && date < startOfDay
  })

  const weekSales = sales.filter((sale) => new Date(sale.saleDate) >= startOfWeek)
  const lastWeekSales = sales.filter((sale) => {
    const date = new Date(sale.saleDate)
    return date >= startOfLastWeek && date < startOfWeek
  })

  const monthSales = sales.filter((sale) => new Date(sale.saleDate) >= startOfMonth)
  const lastMonthSales = sales.filter((sale) => {
    const date = new Date(sale.saleDate)
    return date >= startOfLastMonth && date <= endOfLastMonth
  })

  const todayAmount = Math.max(sumSalesAmount(todaySales), 45500)
  const weekAmount = Math.max(sumSalesAmount(weekSales), 210000)
  const monthAmount = Math.max(sumSalesAmount(monthSales), 850000)
  const todayTransactions = Math.max(todaySales.length, 21)

  const inventory = loadInventory()
  const variants = loadVariants()
  const products = loadProducts()
  const customers = loadCustomers()

  const inventoryValue = inventory.reduce((sum, record) => {
    const variant = variants.find((entry) => entry.id === record.productVariantId)
    return sum + record.quantity * (variant?.costPrice ?? 0)
  }, 0)

  const lowStockCount = inventory.filter((record) => {
    const variant = variants.find((entry) => entry.id === record.productVariantId)
    if (!variant) return false
    return record.quantity > 0 && record.quantity <= record.minimumStockLevel
  }).length

  const totalProducts = products.filter((product) => product.isActive).length
  const totalCustomers = Math.max(customers.length, 430)
  const displayProducts = Math.max(totalProducts, 1250)
  const displayInventoryValue = Math.max(inventoryValue, 2850000)

  const todayTrend = calcTrend(todayAmount, sumSalesAmount(yesterdaySales) || todayAmount * 0.88)
  const weekTrend = calcTrend(weekAmount, sumSalesAmount(lastWeekSales) || weekAmount * 0.92)
  const monthTrend = calcTrend(monthAmount, sumSalesAmount(lastMonthSales) || monthAmount * 0.9)
  const txnTrend = calcTrend(todayTransactions, Math.max(todayTransactions - 3, 1))

  return [
    {
      id: 'today-sales',
      title: "Today's Sales",
      value: todayAmount,
      formattedValue: formatCurrency(todayAmount),
      changePercent: todayTrend.changePercent,
      trend: todayTrend.trend,
      icon: 'banknote',
      format: 'currency',
    },
    {
      id: 'weekly-revenue',
      title: 'Weekly Revenue',
      value: weekAmount,
      formattedValue: formatCurrency(weekAmount),
      changePercent: weekTrend.changePercent,
      trend: weekTrend.trend,
      icon: 'calendar-range',
      format: 'currency',
    },
    {
      id: 'monthly-revenue',
      title: 'Monthly Revenue',
      value: monthAmount,
      formattedValue: formatCurrency(monthAmount),
      changePercent: monthTrend.changePercent,
      trend: monthTrend.trend,
      icon: 'trending-up',
      format: 'currency',
    },
    {
      id: 'today-transactions',
      title: 'Total Transactions Today',
      value: todayTransactions,
      formattedValue: formatNumber(todayTransactions),
      changePercent: txnTrend.changePercent,
      trend: txnTrend.trend,
      icon: 'receipt',
      format: 'number',
    },
    {
      id: 'total-customers',
      title: 'Total Customers',
      value: totalCustomers,
      formattedValue: formatNumber(totalCustomers),
      changePercent: 8.4,
      trend: 'up',
      icon: 'users',
      format: 'number',
    },
    {
      id: 'total-products',
      title: 'Total Products',
      value: displayProducts,
      formattedValue: formatNumber(displayProducts),
      changePercent: 3.2,
      trend: 'up',
      icon: 'package',
      format: 'number',
    },
    {
      id: 'inventory-value',
      title: 'Inventory Value',
      value: displayInventoryValue,
      formattedValue: formatCurrency(displayInventoryValue),
      changePercent: 1.8,
      trend: 'up',
      icon: 'warehouse',
      format: 'currency',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Products',
      value: Math.max(lowStockCount, 12),
      formattedValue: formatNumber(Math.max(lowStockCount, 12)),
      changePercent: -4.5,
      trend: 'down',
      icon: 'alert-triangle',
      format: 'number',
    },
  ]
}

function buildTopProducts(): TopSellingProduct[] {
  const items = loadSaleItems()
  const counts = new Map<string, TopSellingProduct>()

  for (const item of items) {
    const key = item.productVariantId
    const existing = counts.get(key)
    if (existing) {
      existing.unitsSold += item.quantity
      existing.revenue += item.totalPrice
    } else {
      counts.set(key, {
        id: key,
        productName: item.productName,
        variantName: item.variantName,
        unitsSold: item.quantity,
        revenue: item.totalPrice,
      })
    }
  }

  const seedProducts: TopSellingProduct[] = [
    { id: 'seed-1', productName: 'JBL SRX815', variantName: 'Bass', unitsSold: 48, revenue: 263952 },
    { id: 'seed-2', productName: 'Fender Stratocaster', variantName: 'Black', unitsSold: 36, revenue: 129564 },
    { id: 'seed-3', productName: 'Yamaha PSR', variantName: '61 Keys', unitsSold: 32, revenue: 76768 },
    { id: 'seed-4', productName: 'JBL SRX815', variantName: 'Mid', unitsSold: 28, revenue: 148372 },
    { id: 'seed-5', productName: 'Soundcraft Mixer', variantName: 'Analog', unitsSold: 22, revenue: 92378 },
    { id: 'seed-6', productName: 'Shure SM58', variantName: 'Standard', unitsSold: 65, revenue: 77935 },
    { id: 'seed-7', productName: 'Boss Katana 50 MKII', variantName: 'Standard', unitsSold: 18, revenue: 52182 },
    { id: 'seed-8', productName: 'EV EKX Series', variantName: 'Standard', unitsSold: 15, revenue: 94485 },
    { id: 'seed-9', productName: 'Yamaha PSR', variantName: '76 Keys', unitsSold: 14, revenue: 40586 },
    { id: 'seed-10', productName: 'ProNak Bass Speaker', variantName: 'Standard', unitsSold: 12, revenue: 57588 },
  ]

  const merged = [...counts.values(), ...seedProducts]
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 10)

  return merged.map((product, index) => ({ ...product, id: product.id || `top-${index}` }))
}

function buildLowStockItems(): DashboardLowStockItem[] {
  const inventory = loadInventory()
  const variants = loadVariants()
  const products = loadProducts()

  const items = inventory
    .map((record) => {
      const variant = variants.find((entry) => entry.id === record.productVariantId)
      const product = variant ? products.find((entry) => entry.id === variant.productId) : null
      if (!variant || !product) return null

      const isLow = record.quantity <= record.minimumStockLevel
      if (!isLow) return null

      return {
        id: record.id,
        productName: product.name,
        variantName: variant.name,
        currentStock: record.quantity,
        minimumStock: record.minimumStockLevel,
        isCritical: record.quantity === 0,
      }
    })
    .filter((item): item is DashboardLowStockItem => Boolean(item))
    .sort((left, right) => left.currentStock - right.currentStock)

  return items.slice(0, 8)
}

function buildRecentSales(): DashboardRecentSale[] {
  return getCompletedSales()
    .sort((left, right) => new Date(right.saleDate).getTime() - new Date(left.saleDate).getTime())
    .slice(0, 10)
    .map((sale) => ({
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      customerName: sale.customerName,
      amount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      saleDate: sale.saleDate,
    }))
}

function buildPaymentMethods(): PaymentMethodSlice[] {
  const sales = getCompletedSales()
  const totals: Record<PaymentMethod, number> = { cash: 0, mobile_money: 0 }

  for (const sale of sales) {
    totals[sale.paymentMethod] += sale.totalAmount
  }

  if (totals.cash + totals.mobile_money === 0) {
    totals.cash = 612000
    totals.mobile_money = 238000
  }

  const total = totals.cash + totals.mobile_money

  return [
    {
      method: 'cash',
      label: 'Cash',
      value: totals.cash,
      percentage: Math.round((totals.cash / total) * 1000) / 10,
    },
    {
      method: 'mobile_money',
      label: 'Mobile Money',
      value: totals.mobile_money,
      percentage: Math.round((totals.mobile_money / total) * 1000) / 10,
    },
  ]
}

function buildBranchPerformance(): BranchPerformance[] {
  const sales = getCompletedSales()
  const branches = loadBranches()

  const performance = branches.map((branch) => {
    const branchSales = sales.filter((sale) => sale.branchId === branch.id)
    const seedAmounts: Record<string, number> = {
      'branch-main': 520000,
      'branch-accra': 215000,
      'branch-kumasi': 115000,
    }

    return {
      branchId: branch.id,
      branchName: branch.name,
      salesAmount: Math.max(sumSalesAmount(branchSales), seedAmounts[branch.id] ?? 85000),
      transactions: Math.max(branchSales.length, branch.id === 'branch-main' ? 156 : 48),
    }
  })

  return performance.sort((left, right) => right.salesAmount - left.salesAmount)
}

function buildInventoryOverview(): InventoryOverview {
  const inventory = loadInventory()
  const variants = loadVariants()

  let lowStockCount = 0
  let outOfStockCount = 0
  let totalStockQuantity = 0
  let totalInventoryValue = 0

  for (const record of inventory) {
    totalStockQuantity += record.quantity
    const variant = variants.find((entry) => entry.id === record.productVariantId)
    totalInventoryValue += record.quantity * (variant?.costPrice ?? 0)

    if (record.quantity === 0) outOfStockCount += 1
    else if (record.quantity <= record.minimumStockLevel) lowStockCount += 1
  }

  return {
    totalInventoryValue: Math.max(totalInventoryValue, 2850000),
    totalStockQuantity: Math.max(totalStockQuantity, 1250),
    lowStockCount: Math.max(lowStockCount, 12),
    outOfStockCount: Math.max(outOfStockCount, 4),
  }
}

function buildNotifications(
  lowStock: DashboardLowStockItem[],
  transactions: InventoryTransaction[],
): DashboardNotification[] {
  const notifications: DashboardNotification[] = []

  for (const item of lowStock.slice(0, 3)) {
    notifications.push({
      id: `low-${item.id}`,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${item.productName} (${item.variantName}) has ${item.currentStock} units left.`,
      timestamp: new Date().toISOString(),
    })
  }

  for (const transaction of transactions.slice(0, 3)) {
    notifications.push({
      id: `txn-${transaction.id}`,
      type: transaction.transactionType === 'adjustment' ? 'adjustment' : 'activity',
      title: transaction.transactionType === 'adjustment' ? 'Inventory Adjustment' : 'Recent Activity',
      message: `${transaction.productName} ${transaction.variantName} · ${transaction.transactionType.replace('_', ' ')}`,
      timestamp: transaction.createdAt,
    })
  }

  notifications.push({
    id: 'system-1',
    type: 'system',
    title: 'System Alert',
    message: 'Daily sales summary generated successfully.',
    timestamp: new Date().toISOString(),
  })

  return notifications.slice(0, 8)
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    await delay(200)

    const lowStockItems = buildLowStockItems()
    const transactions = loadTransactions()

    return {
      kpis: buildKpis(),
      salesChart: {
        daily: DASHBOARD_SEED_DAILY_CHART,
        weekly: DASHBOARD_SEED_WEEKLY_CHART,
        monthly: DASHBOARD_SEED_MONTHLY_CHART,
      },
      paymentMethods: buildPaymentMethods(),
      topProducts: buildTopProducts(),
      lowStockItems,
      recentSales: buildRecentSales(),
      branchPerformance: buildBranchPerformance(),
      inventoryOverview: buildInventoryOverview(),
      notifications: buildNotifications(lowStockItems, transactions),
    }
  },
}
