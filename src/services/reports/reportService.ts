import type { ReportFilters, ReportChartPoint } from '@/features/reports/types'
import { REPORT_PRODUCT_CATEGORIES } from '@/features/reports/constants'
import { ROLE_LABELS } from '@/constants/roles'
import { CUSTOMERS_STORAGE_KEY, SEED_CUSTOMERS } from '@/services/customers/mock-data'
import { BRANCHES_STORAGE_KEY, INVENTORY_STORAGE_KEY, INVENTORY_TRANSACTIONS_KEY, SEED_BRANCHES, SEED_INVENTORY, SEED_TRANSACTIONS } from '@/services/inventory/mock-data'
import { SEED_CATEGORIES, CATEGORY_STORAGE_KEY } from '@/services/categories/mock-data'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage } from '@/services/products/storage'
import { PURCHASE_ITEMS_STORAGE_KEY, PURCHASES_STORAGE_KEY, SEED_PURCHASE_ITEMS, SEED_PURCHASES } from '@/services/purchases/mock-data'
import { SALE_ITEMS_STORAGE_KEY, SALES_STORAGE_KEY, SEED_SALE_ITEMS, SEED_SALES } from '@/services/sales/mock-data'
import { SEED_SUPPLIERS, SUPPLIERS_STORAGE_KEY } from '@/services/suppliers/mock-data'
import { SEED_SERVICE_JOBS, SEED_SERVICES, SERVICE_JOBS_STORAGE_KEY, SERVICES_STORAGE_KEY } from '@/services/services/mock-data'
import { SEED_USERS, USER_ACTIVITY_STORAGE_KEY, USERS_STORAGE_KEY, SEED_USER_ACTIVITY } from '@/services/users/mock-data'
import { SEED_WAREHOUSES, WAREHOUSE_STOCK_STORAGE_KEY, WAREHOUSE_TRANSFERS_STORAGE_KEY, WAREHOUSES_STORAGE_KEY } from '@/services/warehouses/mock-data'
import type { WarehouseStockRecord, WarehouseTransfer } from '@/features/warehouses/types'
import type { Sale, SaleItem } from '@/features/sales/types'
import type { Purchase } from '@/features/purchases/types'
import type { InventoryTransaction } from '@/features/inventory/types'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function loadSales(): Sale[] {
  return readStorage(SALES_STORAGE_KEY, SEED_SALES)
}

function loadSaleItems(): SaleItem[] {
  return readStorage(SALE_ITEMS_STORAGE_KEY, SEED_SALE_ITEMS)
}

function loadPurchases(): Purchase[] {
  return readStorage(PURCHASES_STORAGE_KEY, SEED_PURCHASES)
}

function loadPurchaseItems() {
  return readStorage(PURCHASE_ITEMS_STORAGE_KEY, SEED_PURCHASE_ITEMS)
}

function loadProducts() {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants() {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function loadCategories() {
  return readStorage(CATEGORY_STORAGE_KEY, SEED_CATEGORIES)
}

function loadInventory() {
  return readStorage(INVENTORY_STORAGE_KEY, SEED_INVENTORY)
}

function loadTransactions(): InventoryTransaction[] {
  return readStorage(INVENTORY_TRANSACTIONS_KEY, SEED_TRANSACTIONS)
}

function loadCustomers() {
  return readStorage(CUSTOMERS_STORAGE_KEY, SEED_CUSTOMERS)
}

function loadSuppliers() {
  return readStorage(SUPPLIERS_STORAGE_KEY, SEED_SUPPLIERS)
}

function loadServices() {
  return readStorage(SERVICES_STORAGE_KEY, SEED_SERVICES)
}

function loadJobs() {
  return readStorage(SERVICE_JOBS_STORAGE_KEY, SEED_SERVICE_JOBS)
}

function loadUsers() {
  return readStorage(USERS_STORAGE_KEY, SEED_USERS)
}

function loadActivities() {
  return readStorage(USER_ACTIVITY_STORAGE_KEY, SEED_USER_ACTIVITY)
}

function loadWarehouses() {
  return readStorage(WAREHOUSES_STORAGE_KEY, SEED_WAREHOUSES)
}

function loadWarehouseStock(): WarehouseStockRecord[] {
  return readStorage(WAREHOUSE_STOCK_STORAGE_KEY, [] as WarehouseStockRecord[])
}

function loadTransfers(): WarehouseTransfer[] {
  return readStorage(WAREHOUSE_TRANSFERS_STORAGE_KEY, [] as WarehouseTransfer[])
}

function loadBranches() {
  return readStorage(BRANCHES_STORAGE_KEY, SEED_BRANCHES)
}

function inDateRange(value: string, filters: ReportFilters): boolean {
  const date = new Date(value)
  if (filters.dateFrom && date < new Date(`${filters.dateFrom}T00:00:00`)) {
    return false
  }
  if (filters.dateTo && date > new Date(`${filters.dateTo}T23:59:59`)) {
    return false
  }
  return true
}

function filterSales(filters: ReportFilters): Sale[] {
  return loadSales().filter((sale) => {
    if (sale.status !== 'completed') return false
    if (!inDateRange(sale.saleDate, filters)) return false
    if (filters.branchId && filters.branchId !== 'all' && sale.branchId !== filters.branchId) {
      return false
    }
    if (filters.userId && filters.userId !== 'all' && sale.cashierId !== filters.userId) {
      return false
    }
    return true
  })
}

function filterPurchases(filters: ReportFilters): Purchase[] {
  return loadPurchases().filter((purchase) => {
    if (!inDateRange(purchase.purchaseDate, filters)) return false
    if (filters.warehouseId && filters.warehouseId !== 'all' && purchase.warehouseId !== filters.warehouseId) {
      return false
    }
    return true
  })
}

function getCategoryName(categoryId: string): string {
  return loadCategories().find((entry) => entry.id === categoryId)?.name ?? 'Uncategorized'
}

function getProductCategoryName(productId: string): string {
  const product = loadProducts().find((entry) => entry.id === productId)
  if (!product) return 'Uncategorized'
  return getCategoryName(product.categoryId)
}

function matchesCategoryFilter(productId: string, filters: ReportFilters): boolean {
  if (!filters.categoryId || filters.categoryId === 'all') return true
  const product = loadProducts().find((entry) => entry.id === productId)
  return product?.categoryId === filters.categoryId
}

function buildMonthlyTrend(values: Array<{ date: string; amount: number }>, months = 6): ReportChartPoint[] {
  const now = new Date()
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
    const month = date.getMonth()
    const year = date.getFullYear()
    const value = values
      .filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.getMonth() === month && entryDate.getFullYear() === year
      })
      .reduce((sum, entry) => sum + entry.amount, 0)

    return { label: MONTH_LABELS[month], value }
  })
}

function buildDailyTrend(values: Array<{ date: string; amount: number }>, days = 7): ReportChartPoint[] {
  const now = new Date()
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (days - 1 - index))
    const label = date.toLocaleDateString('en-GH', { weekday: 'short' })
    const value = values
      .filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.toDateString() === date.toDateString()
      })
      .reduce((sum, entry) => sum + entry.amount, 0)

    return { label, value }
  })
}

export const reportFilterDefaults: ReportFilters = {
  branchId: 'all',
  warehouseId: 'all',
  userId: 'all',
  categoryId: 'all',
  period: 'monthly',
}

export const reportService = {
  async getFilterOptions() {
    await delay(120)
    return {
      branches: loadBranches().map((branch) => ({ id: branch.id, name: branch.name })),
      warehouses: loadWarehouses().map((warehouse) => ({
        id: warehouse.id,
        name: warehouse.warehouseName,
      })),
      users: loadUsers().map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      })),
      categories: loadCategories().map((category) => ({ id: category.id, name: category.name })),
    }
  },

  async getReportsDashboard(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const sales = filterSales(filters)
    const purchases = filterPurchases(filters)
    const stock = loadWarehouseStock()
    const customers = loadCustomers()
    const suppliers = loadSuppliers()
    const services = loadServices().filter((entry) => entry.status === 'active')
    const jobs = loadJobs().filter(
      (job) => job.status === 'completed' && inDateRange(job.completionDate ?? job.serviceDate, filters),
    )

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const inventoryValue = stock.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0)
    const serviceRevenue = jobs.reduce((sum, job) => sum + job.amount, 0)
    const monthlyProfit = totalRevenue + serviceRevenue - totalPurchases

    return {
      totalRevenue,
      totalPurchases,
      inventoryValue,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.filter((entry) => entry.isActive).length,
      totalServices: services.length,
      monthlyProfit,
      monthlyTransactions: sales.length + purchases.length + jobs.length,
      cards: [
        { label: 'Total Revenue', value: totalRevenue.toFixed(2) },
        { label: 'Total Purchases', value: totalPurchases.toFixed(2) },
        { label: 'Inventory Value', value: inventoryValue.toFixed(2) },
        { label: 'Total Customers', value: String(customers.length) },
        { label: 'Total Suppliers', value: String(suppliers.length) },
        { label: 'Total Services', value: String(services.length) },
        { label: 'Monthly Profit', value: monthlyProfit.toFixed(2) },
        { label: 'Monthly Transactions', value: String(sales.length + purchases.length + jobs.length) },
      ],
    }
  },

  async getSalesReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const sales = filterSales(filters)
    const saleItems = loadSaleItems().filter(
      (item) =>
        sales.some((sale) => sale.id === item.saleId) && matchesCategoryFilter(item.productId, filters),
    )

    const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const quantitySold = saleItems.reduce((sum, item) => sum + item.quantity, 0)

    const byProductMap = new Map<string, { quantity: number; revenue: number }>()
    saleItems.forEach((item) => {
      const current = byProductMap.get(item.productName) ?? { quantity: 0, revenue: 0 }
      byProductMap.set(item.productName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.totalPrice,
      })
    })

    const byCategoryMap = new Map<string, { quantity: number; revenue: number }>()
    saleItems.forEach((item) => {
      const categoryName = getProductCategoryName(item.productId)
      const current = byCategoryMap.get(categoryName) ?? { quantity: 0, revenue: 0 }
      byCategoryMap.set(categoryName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.totalPrice,
      })
    })

    const warehouses = loadWarehouses()
    const byWarehouseMap = new Map<string, { quantity: number; revenue: number }>()
    saleItems.forEach((item, index) => {
      const warehouse = warehouses[index % warehouses.length]
      const current = byWarehouseMap.get(warehouse.warehouseName) ?? { quantity: 0, revenue: 0 }
      byWarehouseMap.set(warehouse.warehouseName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.totalPrice,
      })
    })

    const byPaymentMap = new Map<string, { value: number; count: number }>()
    sales.forEach((sale) => {
      const label = sale.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money'
      const current = byPaymentMap.get(label) ?? { value: 0, count: 0 }
      byPaymentMap.set(label, {
        value: current.value + sale.totalAmount,
        count: current.count + 1,
      })
    })

    const byCashierMap = new Map<string, { transactions: number; revenue: number }>()
    sales.forEach((sale) => {
      const current = byCashierMap.get(sale.cashierName) ?? { transactions: 0, revenue: 0 }
      byCashierMap.set(sale.cashierName, {
        transactions: current.transactions + 1,
        revenue: current.revenue + sale.totalAmount,
      })
    })

    const trendValues = sales.map((sale) => ({ date: sale.saleDate, amount: sale.totalAmount }))

    return {
      summary: { revenue, quantitySold, transactions: sales.length },
      dailyTrend: buildDailyTrend(trendValues),
      monthlyTrend: buildMonthlyTrend(trendValues),
      byProduct: [...byProductMap.entries()]
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue),
      byCategory: [...byCategoryMap.entries()]
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue),
      byWarehouse: [...byWarehouseMap.entries()]
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue),
      byPaymentMethod: [...byPaymentMap.entries()].map(([name, stats]) => ({ name, ...stats })),
      byCashier: [...byCashierMap.entries()]
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue),
      periodBreakdown: buildMonthlyTrend(trendValues).map((entry) => ({
        label: entry.label,
        revenue: entry.value,
        transactions: Math.max(1, Math.round(entry.value / 250)),
        quantity: Math.max(1, Math.round(entry.value / 180)),
      })),
    }
  },

  async getInventoryReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const products = loadProducts()
    const variants = loadVariants()
    const stock = loadWarehouseStock()
    const warehouses = loadWarehouses()
    const inventory = loadInventory()
    const transactions = loadTransactions().filter((entry) => inDateRange(entry.createdAt, filters))

    const rows = products.flatMap((product) => {
      if (filters.categoryId && filters.categoryId !== 'all' && product.categoryId !== filters.categoryId) {
        return []
      }

      const productVariants = variants.filter((variant) => variant.productId === product.id)
      const categoryName = getCategoryName(product.categoryId)

      if (stock.length > 0) {
        return stock
          .filter((entry) => entry.productId === product.id)
          .filter((entry) => {
            if (filters.warehouseId && filters.warehouseId !== 'all') {
              return entry.warehouseId === filters.warehouseId
            }
            return true
          })
          .map((entry) => {
            const warehouseName =
              warehouses.find((warehouse) => warehouse.id === entry.warehouseId)?.warehouseName ??
              'Unknown Warehouse'
            const quantity = entry.quantity
            const status =
              quantity <= 0 ? 'out_of_stock' : quantity <= 5 ? 'low_stock' : 'in_stock'

            return {
              productName: product.name,
              categoryName,
              quantity,
              warehouseName,
              inventoryValue: quantity * entry.unitCost,
              status: status as 'in_stock' | 'low_stock' | 'out_of_stock',
            }
          })
      }

      const productVariantIds = productVariants.map((variant) => variant.id)
      const branchStock = inventory.filter((entry) => productVariantIds.includes(entry.productVariantId))
      const quantity = branchStock.reduce((sum, entry) => sum + entry.quantity, 0)
      const avgCost =
        productVariants.reduce((sum, variant) => sum + variant.costPrice, 0) /
        Math.max(productVariants.length, 1)

      return [
        {
          productName: product.name,
          categoryName,
          quantity,
          warehouseName: warehouses[0]?.warehouseName ?? 'Main Store',
          inventoryValue: quantity * avgCost,
          status: (quantity <= 0 ? 'out_of_stock' : quantity <= 5 ? 'low_stock' : 'in_stock') as
            | 'in_stock'
            | 'low_stock'
            | 'out_of_stock',
        },
      ]
    })

    const lowStock = rows.filter((row) => row.status === 'low_stock')
    const outOfStock = rows.filter((row) => row.status === 'out_of_stock')

    const valuationByCategory = REPORT_PRODUCT_CATEGORIES.map((label) => ({
      label,
      value: rows
        .filter((row) => row.categoryName.toLowerCase().includes(label.toLowerCase()))
        .reduce((sum, row) => sum + row.inventoryValue, 0),
    }))

    const byWarehouse = warehouses.map((warehouse) => {
      const warehouseRows = rows.filter((row) => row.warehouseName === warehouse.warehouseName)
      return {
        warehouseName: warehouse.warehouseName,
        quantity: warehouseRows.reduce((sum, row) => sum + row.quantity, 0),
        value: warehouseRows.reduce((sum, row) => sum + row.inventoryValue, 0),
        productCount: warehouseRows.length,
      }
    })

    return {
      summary: {
        totalProducts: rows.length,
        totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
        inventoryValue: rows.reduce((sum, row) => sum + row.inventoryValue, 0),
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
      },
      currentInventory: rows,
      stockMovement: buildDailyTrend(
        transactions.map((entry) => ({
          date: entry.createdAt,
          amount: entry.quantity,
        })),
      ).map((entry) => ({
        label: entry.label,
        stockIn: Math.max(0, entry.value),
        stockOut: Math.max(0, -entry.value),
      })),
      valuationByCategory,
      lowStock,
      outOfStock,
      byWarehouse,
    }
  },

  async getPurchaseReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const purchases = filterPurchases(filters)
    const items = loadPurchaseItems().filter((item) => purchases.some((purchase) => purchase.id === item.purchaseId))

    const bySupplierMap = new Map<string, { purchases: number; quantity: number; totalCost: number }>()
    purchases.forEach((purchase) => {
      const purchaseItems = items.filter((item) => item.purchaseId === purchase.id)
      const quantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0)
      const current = bySupplierMap.get(purchase.supplierName) ?? { purchases: 0, quantity: 0, totalCost: 0 }
      bySupplierMap.set(purchase.supplierName, {
        purchases: current.purchases + 1,
        quantity: current.quantity + quantity,
        totalCost: current.totalCost + purchase.totalAmount,
      })
    })

    const byWarehouseMap = new Map<string, { purchases: number; quantity: number; totalCost: number }>()
    purchases.forEach((purchase) => {
      const purchaseItems = items.filter((item) => item.purchaseId === purchase.id)
      const quantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0)
      const current = byWarehouseMap.get(purchase.warehouseName) ?? { purchases: 0, quantity: 0, totalCost: 0 }
      byWarehouseMap.set(purchase.warehouseName, {
        purchases: current.purchases + 1,
        quantity: current.quantity + quantity,
        totalCost: current.totalCost + purchase.totalAmount,
      })
    })

    const totalCost = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      summary: {
        totalPurchases: purchases.length,
        totalCost,
        totalQuantity,
      },
      bySupplier: [...bySupplierMap.entries()]
        .map(([supplierName, stats]) => ({ supplierName, ...stats }))
        .sort((a, b) => b.totalCost - a.totalCost),
      byWarehouse: [...byWarehouseMap.entries()]
        .map(([warehouseName, stats]) => ({ warehouseName, ...stats }))
        .sort((a, b) => b.totalCost - a.totalCost),
      monthly: buildMonthlyTrend(
        purchases.map((purchase) => ({ date: purchase.purchaseDate, amount: purchase.totalAmount })),
      ),
      costAnalysis: [...bySupplierMap.entries()]
        .map(([label, stats]) => ({
          label,
          cost: stats.totalCost,
          share: totalCost > 0 ? Math.round((stats.totalCost / totalCost) * 100) : 0,
        }))
        .sort((a, b) => b.cost - a.cost),
      rows: items.map((item) => {
        const purchase = purchases.find((entry) => entry.id === item.purchaseId)
        return {
          supplierName: purchase?.supplierName ?? 'Unknown',
          productName: item.productName,
          quantityPurchased: item.quantity,
          totalCost: item.totalCost,
          purchaseDate: purchase?.purchaseDate ?? '',
        }
      }),
    }
  },

  async getWarehouseReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const inventoryReport = await this.getInventoryReport(filters)
    const transfers = loadTransfers().filter((entry) => inDateRange(entry.createdAt, filters))

    return {
      summary: {
        totalStock: inventoryReport.summary.totalQuantity,
        totalValue: inventoryReport.summary.inventoryValue,
        totalProducts: inventoryReport.summary.totalProducts,
        transfersThisMonth: transfers.length,
      },
      stockReport: inventoryReport.byWarehouse.map((entry) => ({
        warehouseName: entry.warehouseName,
        stockQuantity: entry.quantity,
        inventoryValue: entry.value,
        productCount: entry.productCount,
      })),
      transferReport: buildMonthlyTrend(
        transfers.map((entry) => ({ date: entry.createdAt, amount: entry.quantity ?? 1 })),
      ).map((entry) => ({
        label: entry.label,
        transfers: Math.max(1, Math.round(entry.value / 10)),
        quantity: entry.value,
      })),
      valueReport: inventoryReport.byWarehouse.map((entry) => ({
        label: entry.warehouseName,
        value: entry.value,
      })),
    }
  },

  async getCustomerReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const customers = loadCustomers()
    const sales = filterSales(filters)

    const rows = customers.map((customer) => {
      const customerSales = sales.filter((sale) => sale.customerId === customer.id)
      const amountSpent = customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      const lastPurchaseDate =
        customerSales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0]
          ?.saleDate ?? null

      return {
        customerName: customer.fullName,
        purchases: customerSales.length,
        amountSpent,
        lastPurchaseDate,
        frequency:
          customerSales.length >= 5 ? 'High' : customerSales.length >= 2 ? 'Medium' : 'Low',
      }
    })

    const activeCustomers = rows.filter((row) => row.purchases > 0)
    const totalSpent = activeCustomers.reduce((sum, row) => sum + row.amountSpent, 0)

    return {
      summary: {
        totalCustomers: customers.length,
        activeCustomers: activeCustomers.length,
        averageSpend: activeCustomers.length > 0 ? totalSpent / activeCustomers.length : 0,
        totalSpent,
      },
      topCustomers: [...rows].sort((a, b) => b.amountSpent - a.amountSpent).slice(0, 10),
      spendingAnalysis: buildMonthlyTrend(
        sales.map((sale) => ({ date: sale.saleDate, amount: sale.totalAmount })),
      ),
      frequencyAnalysis: [
        { label: 'High', customers: rows.filter((row) => row.frequency === 'High').length },
        { label: 'Medium', customers: rows.filter((row) => row.frequency === 'Medium').length },
        { label: 'Low', customers: rows.filter((row) => row.frequency === 'Low').length },
      ],
      purchaseHistory: [...rows].sort((a, b) => b.purchases - a.purchases),
    }
  },

  async getSupplierReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const suppliers = loadSuppliers()
    const purchases = filterPurchases(filters)
    const items = loadPurchaseItems()

    const rows = suppliers.map((supplier) => {
      const supplierPurchases = purchases.filter((purchase) => purchase.supplierId === supplier.id)
      const supplierItems = items.filter((item) =>
        supplierPurchases.some((purchase) => purchase.id === item.purchaseId),
      )
      const lastSupplyDate =
        supplierPurchases.sort(
          (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
        )[0]?.purchaseDate ?? null

      return {
        supplierName: supplier.name,
        totalPurchases: supplierPurchases.length,
        totalQuantitySupplied: supplierItems.reduce((sum, item) => sum + item.quantity, 0),
        lastSupplyDate,
        performanceScore: Math.min(
          100,
          supplierPurchases.length * 12 + supplierItems.reduce((sum, item) => sum + item.quantity, 0),
        ),
      }
    })

    const activeRows = rows.filter((row) => row.totalPurchases > 0)

    return {
      summary: {
        totalSuppliers: suppliers.length,
        activeSuppliers: activeRows.length,
        totalPurchaseValue: activeRows.reduce(
          (sum, row) =>
            sum +
            purchases
              .filter((purchase) => purchase.supplierName === row.supplierName)
              .reduce((inner, purchase) => inner + purchase.totalAmount, 0),
          0,
        ),
        totalQuantity: activeRows.reduce((sum, row) => sum + row.totalQuantitySupplied, 0),
      },
      purchaseReport: [...rows].sort((a, b) => b.totalPurchases - a.totalPurchases),
      topSuppliers: [...rows].sort((a, b) => b.totalQuantitySupplied - a.totalQuantitySupplied).slice(0, 8),
      performance: activeRows.map((row) => ({
        label: row.supplierName,
        value: row.performanceScore,
      })),
    }
  },

  async getServiceReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const services = loadServices()
    const jobs = loadJobs().filter(
      (job) => job.status === 'completed' && inDateRange(job.completionDate ?? job.serviceDate, filters),
    )

    const rows = services.map((service) => {
      const serviceJobs = jobs.filter((job) => job.serviceId === service.id)
      return {
        serviceName: service.serviceName,
        jobs: serviceJobs.length,
        revenue: serviceJobs.reduce((sum, job) => sum + job.amount, 0),
        categoryName: service.categoryId,
      }
    })

    const categoryMap = new Map<string, { jobs: number; revenue: number }>()
    rows.forEach((row) => {
      const current = categoryMap.get(row.categoryName) ?? { jobs: 0, revenue: 0 }
      categoryMap.set(row.categoryName, {
        jobs: current.jobs + row.jobs,
        revenue: current.revenue + row.revenue,
      })
    })

    const technicianMap = new Map<string, { jobs: number; revenue: number }>()
    jobs.forEach((job) => {
      const current = technicianMap.get(job.technician) ?? { jobs: 0, revenue: 0 }
      technicianMap.set(job.technician, {
        jobs: current.jobs + 1,
        revenue: current.revenue + job.amount,
      })
    })

    const serviceRevenue = jobs.reduce((sum, job) => sum + job.amount, 0)

    return {
      summary: {
        totalJobs: jobs.length,
        completedJobs: jobs.length,
        serviceRevenue,
        averageJobValue: jobs.length > 0 ? serviceRevenue / jobs.length : 0,
      },
      revenueReport: buildMonthlyTrend(jobs.map((job) => ({ date: job.serviceDate, amount: job.amount }))),
      categoryReport: [...categoryMap.entries()].map(([categoryName, stats]) => ({
        categoryName,
        ...stats,
      })),
      technicianPerformance: [...technicianMap.entries()]
        .map(([technician, stats]) => ({ technician, ...stats }))
        .sort((a, b) => b.revenue - a.revenue),
      rows: [...rows].sort((a, b) => b.revenue - a.revenue),
    }
  },

  async getUserReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const users = loadUsers()
    const activities = loadActivities().filter((entry) => inDateRange(entry.createdAt, filters))
    const sales = filterSales(filters)

    const rows = users.map((user) => {
      const userActivities = activities.filter((entry) => entry.userId === user.id)
      const userSales = sales.filter((sale) => sale.cashierId === user.id)
      const inventoryActions = userActivities.filter((entry) => entry.module === 'Inventory').length

      return {
        userName: `${user.firstName} ${user.lastName}`,
        role: ROLE_LABELS[user.roleId],
        actions: userActivities.length,
        lastLogin: user.lastLogin,
        salesCount: userSales.length,
        inventoryActions,
      }
    })

    return {
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.status === 'active').length,
        loginsThisMonth: activities.filter((entry) => entry.activity === 'User Login').length,
        totalActions: activities.length,
      },
      loginReport: [...rows].sort((a, b) => {
        const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0
        const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0
        return bTime - aTime
      }),
      salesByUser: [...rows].sort((a, b) => b.salesCount - a.salesCount),
      inventoryActions: [...rows].sort((a, b) => b.inventoryActions - a.inventoryActions),
      activitySummary: [...rows].sort((a, b) => b.actions - a.actions),
    }
  },

  async getProfitLossReport(filters: ReportFilters = reportFilterDefaults) {
    await delay(180)
    const salesReport = await this.getSalesReport(filters)
    const purchaseReport = await this.getPurchaseReport(filters)
    const serviceReport = await this.getServiceReport(filters)

    const totalRevenue = salesReport.summary.revenue + serviceReport.summary.serviceRevenue
    const purchaseCosts = purchaseReport.summary.totalCost
    const serviceCosts = Math.round(serviceReport.summary.serviceRevenue * 0.35)
    const totalExpenses = purchaseCosts + serviceCosts
    const grossProfit = totalRevenue - purchaseCosts
    const netProfit = totalRevenue - totalExpenses

    return {
      totalRevenue,
      purchaseCosts,
      serviceCosts,
      totalExpenses,
      grossProfit,
      netProfit,
      revenueBreakdown: [
        { label: 'Product Sales', value: salesReport.summary.revenue },
        { label: 'Service Revenue', value: serviceReport.summary.serviceRevenue },
      ],
      expenseBreakdown: [
        { label: 'Purchase Costs', value: purchaseCosts },
        { label: 'Service Costs', value: serviceCosts },
      ],
      monthlyTrend: buildMonthlyTrend([
        ...filterSales(filters).map((sale) => ({ date: sale.saleDate, amount: sale.totalAmount })),
        ...loadJobs()
          .filter((job) => job.status === 'completed')
          .map((job) => ({ date: job.serviceDate, amount: job.amount })),
      ]).map((entry) => ({
        ...entry,
        secondaryValue: Math.round(entry.value * 0.62),
      })),
    }
  },
}
