import type {
  CustomerReportData,
  CustomerReportRow,
  InventoryReportData,
  ProfitLossReportData,
  PurchaseReportData,
  ReportFilters,
  ReportsDashboardSummary,
  SalesReportData,
  ServiceReportData,
  SupplierReportData,
  SupplierReportRow,
  UserReportData,
  UserReportRow,
  WarehouseReportData,
} from '@/features/reports/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiGet } from '@/services/api/http'
import { buildQueryParams, mapReportChartPoint } from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

export const reportFilterDefaults: ReportFilters = {
  branchId: 'all',
  warehouseId: 'all',
  userId: 'all',
  categoryId: 'all',
  period: 'monthly',
}

function toReportQuery(filters: ReportFilters = reportFilterDefaults) {
  return buildQueryParams({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    branchId: filters.branchId,
    warehouseId: filters.warehouseId,
    userId: filters.userId,
    categoryId: filters.categoryId,
    period: filters.period,
  })
}

function mapInventoryStatus(value: string): InventoryReportData['currentInventory'][number]['status'] {
  if (value === 'low_stock') return 'low_stock'
  if (value === 'out_of_stock') return 'out_of_stock'
  return 'in_stock'
}

function mapCustomerReportRow(item: Record<string, unknown>): CustomerReportRow {
  return {
    customerName: String(item.customerName ?? ''),
    purchases: Number(item.purchases ?? 0),
    amountSpent: Number(item.amountSpent ?? 0),
    lastPurchaseDate: item.lastPurchaseDate ? String(item.lastPurchaseDate) : null,
    frequency: String(item.frequency ?? 'Low'),
  }
}

function mapSupplierReportRow(item: Record<string, unknown>): SupplierReportRow {
  return {
    supplierName: String(item.supplierName ?? ''),
    totalPurchases: Number(item.totalPurchases ?? 0),
    totalQuantitySupplied: Number(item.totalQuantitySupplied ?? 0),
    lastSupplyDate: item.lastSupplyDate ? String(item.lastSupplyDate) : null,
    performanceScore: Number(item.performanceScore ?? 0),
  }
}

function mapUserReportRow(item: Record<string, unknown>): UserReportRow {
  return {
    userName: String(item.userName ?? ''),
    role: String(item.role ?? ''),
    actions: Number(item.actions ?? 0),
    lastLogin: item.lastLogin ? String(item.lastLogin) : null,
    salesCount: Number(item.salesCount ?? 0),
    inventoryActions: Number(item.inventoryActions ?? 0),
  }
}

export const reportService = {
  async getFilterOptions() {
    const [branches, warehouses, users, categories] = await Promise.all([
      apiGet<Array<Record<string, unknown>>>(API_ENDPOINTS.settings.branches).catch(() => []),
      apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.warehouses, {
        params: { page: 1, pageSize: 100 },
      }),
      apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.users, {
        params: { page: 1, pageSize: 100 },
      }),
      apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.categories, {
        params: { page: 1, pageSize: 100 },
      }),
    ])

    return {
      branches: branches.map((branch) => ({
        id: String(branch.id),
        name: String(branch.branchName ?? branch.name ?? ''),
      })),
      warehouses: warehouses.items.map((warehouse) => ({
        id: String(warehouse.id),
        name: String(warehouse.warehouseName ?? ''),
      })),
      users: users.items.map((user) => ({
        id: String(user.id),
        name: String(user.fullName ?? user.username ?? ''),
      })),
      categories: categories.items.map((category) => ({
        id: String(category.id),
        name: String(category.name ?? ''),
      })),
    }
  },

  async getReportsDashboard(filters: ReportFilters = reportFilterDefaults): Promise<ReportsDashboardSummary> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.dashboard, {
      params: toReportQuery(filters),
    })

    return {
      totalRevenue: Number(dto.totalRevenue ?? 0),
      totalPurchases: Number(dto.totalPurchases ?? 0),
      inventoryValue: Number(dto.inventoryValue ?? 0),
      totalCustomers: Number(dto.totalCustomers ?? 0),
      totalSuppliers: Number(dto.totalSuppliers ?? 0),
      totalServices: Number(dto.totalServices ?? 0),
      monthlyProfit: Number(dto.monthlyProfit ?? 0),
      monthlyTransactions: Number(dto.monthlyTransactions ?? 0),
      cards: Array.isArray(dto.cards)
        ? dto.cards.map((item) => {
            const card = item as Record<string, unknown>
            return {
              label: String(card.label ?? ''),
              value: String(card.value ?? ''),
              helperText: card.helperText ? String(card.helperText) : undefined,
            }
          })
        : [],
    }
  },

  async getSalesReport(filters: ReportFilters = reportFilterDefaults): Promise<SalesReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.sales, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const monthlyTrend = Array.isArray(dto.monthlyTrend)
      ? dto.monthlyTrend.map((item) => mapReportChartPoint(item as Record<string, unknown>))
      : []

    return {
      summary: {
        revenue: Number(summary.revenue ?? 0),
        quantitySold: Number(summary.quantitySold ?? 0),
        transactions: Number(summary.transactions ?? 0),
      },
      dailyTrend: Array.isArray(dto.dailyTrend)
        ? dto.dailyTrend.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      monthlyTrend,
      byProduct: Array.isArray(dto.byProduct) ? dto.byProduct : [],
      byCategory: Array.isArray(dto.byCategory) ? dto.byCategory : [],
      byWarehouse: Array.isArray(dto.byWarehouse) ? dto.byWarehouse : [],
      byPaymentMethod: Array.isArray(dto.byPaymentMethod) ? dto.byPaymentMethod : [],
      byCashier: Array.isArray(dto.byCashier) ? dto.byCashier : [],
      periodBreakdown: monthlyTrend.map((entry) => ({
        label: entry.label,
        revenue: entry.value,
        transactions: Math.max(1, Math.round(entry.value / 250)),
        quantity: Math.max(1, Math.round(entry.value / 180)),
      })),
    }
  },

  async getInventoryReport(filters: ReportFilters = reportFilterDefaults): Promise<InventoryReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.inventory, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>

    const mapRow = (item: Record<string, unknown>) => ({
      productName: String(item.productName ?? ''),
      categoryName: String(item.categoryName ?? ''),
      quantity: Number(item.quantity ?? 0),
      warehouseName: String(item.warehouseName ?? ''),
      inventoryValue: Number(item.inventoryValue ?? 0),
      status: mapInventoryStatus(String(item.status ?? 'in_stock')),
    })

    const currentInventory = Array.isArray(dto.currentInventory)
      ? dto.currentInventory.map((item) => mapRow(item as Record<string, unknown>))
      : []

    return {
      summary: {
        totalProducts: Number(summary.totalProducts ?? 0),
        totalQuantity: Number(summary.totalQuantity ?? 0),
        inventoryValue: Number(summary.inventoryValue ?? 0),
        lowStockCount: Number(summary.lowStockCount ?? 0),
        outOfStockCount: Number(summary.outOfStockCount ?? 0),
      },
      currentInventory,
      stockMovement: Array.isArray(dto.stockMovement) ? dto.stockMovement : [],
      valuationByCategory: Array.isArray(dto.valuationByCategory)
        ? dto.valuationByCategory.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      lowStock: Array.isArray(dto.lowStock)
        ? dto.lowStock.map((item) => mapRow(item as Record<string, unknown>))
        : [],
      outOfStock: Array.isArray(dto.outOfStock)
        ? dto.outOfStock.map((item) => mapRow(item as Record<string, unknown>))
        : [],
      byWarehouse: Array.isArray(dto.byWarehouse) ? dto.byWarehouse : [],
    }
  },

  async getPurchaseReport(filters: ReportFilters = reportFilterDefaults): Promise<PurchaseReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.purchases, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const bySupplier = Array.isArray(dto.bySupplier) ? dto.bySupplier : []
    const totalCost = Number(summary.totalCost ?? 0)

    return {
      summary: {
        totalPurchases: Number(summary.totalPurchases ?? 0),
        totalCost,
        totalQuantity: Number(summary.totalQuantity ?? 0),
      },
      bySupplier,
      byWarehouse: Array.isArray(dto.byWarehouse) ? dto.byWarehouse : [],
      monthly: Array.isArray(dto.monthly)
        ? dto.monthly.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      costAnalysis: bySupplier.map((item) => {
        const entry = item as Record<string, unknown>
        const cost = Number(entry.totalCost ?? 0)
        return {
          label: String(entry.supplierName ?? entry.name ?? ''),
          cost,
          share: totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0,
        }
      }),
      rows: Array.isArray(dto.rows)
        ? dto.rows.map((item) => {
            const row = item as Record<string, unknown>
            return {
              supplierName: String(row.supplierName ?? ''),
              productName: String(row.productName ?? ''),
              quantityPurchased: Number(row.quantityPurchased ?? 0),
              totalCost: Number(row.totalCost ?? 0),
              purchaseDate: String(row.purchaseDate ?? ''),
            }
          })
        : [],
    }
  },

  async getWarehouseReport(filters: ReportFilters = reportFilterDefaults): Promise<WarehouseReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.warehouses, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const stockReport = Array.isArray(dto.stockReport)
      ? dto.stockReport.map((item) => {
          const row = item as Record<string, unknown>
          return {
            warehouseName: String(row.warehouseName ?? ''),
            stockQuantity: Number(row.stockQuantity ?? 0),
            inventoryValue: Number(row.inventoryValue ?? 0),
            productCount: Number(row.productCount ?? 0),
          }
        })
      : []
    const valueReport = Array.isArray(dto.valueReport)
      ? dto.valueReport.map((item) => mapReportChartPoint(item as Record<string, unknown>))
      : []

    return {
      summary: {
        totalStock: Number(summary.totalStock ?? 0),
        totalValue: Number(summary.totalValue ?? 0),
        totalProducts: Number(summary.totalProducts ?? 0),
        transfersThisMonth: Number(summary.transfersThisMonth ?? 0),
      },
      stockReport,
      transferReport: valueReport.map((entry) => ({
        label: entry.label,
        transfers: Math.max(1, Math.round(entry.value / 10)),
        quantity: entry.value,
      })),
      valueReport,
    }
  },

  async getCustomerReport(filters: ReportFilters = reportFilterDefaults): Promise<CustomerReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.customers, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const topCustomers = Array.isArray(dto.topCustomers) ? dto.topCustomers : []
    const purchaseHistory = Array.isArray(dto.purchaseHistory) ? dto.purchaseHistory : []

    return {
      summary: {
        totalCustomers: Number(summary.totalCustomers ?? 0),
        activeCustomers: Number(summary.activeCustomers ?? 0),
        averageSpend: Number(summary.averageSpend ?? 0),
        totalSpent: Number(summary.totalSpent ?? 0),
      },
      topCustomers: topCustomers.map((item) => mapCustomerReportRow(item as Record<string, unknown>)),
      spendingAnalysis: Array.isArray(dto.spendingAnalysis)
        ? dto.spendingAnalysis.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      frequencyAnalysis: purchaseHistory.reduce<Array<{ label: string; customers: number }>>(
        (acc, item) => {
          const row = item as Record<string, unknown>
          const label = String(row.frequency ?? 'Low')
          const existing = acc.find((entry) => entry.label === label)
          if (existing) existing.customers += 1
          else acc.push({ label, customers: 1 })
          return acc
        },
        [],
      ),
      purchaseHistory: purchaseHistory.map((item) =>
        mapCustomerReportRow(item as Record<string, unknown>),
      ),
    }
  },

  async getSupplierReport(filters: ReportFilters = reportFilterDefaults): Promise<SupplierReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.suppliers, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const purchaseReport = Array.isArray(dto.purchaseReport) ? dto.purchaseReport : []

    return {
      summary: {
        totalSuppliers: Number(summary.totalSuppliers ?? 0),
        activeSuppliers: Number(summary.activeSuppliers ?? 0),
        totalPurchaseValue: Number(summary.totalPurchaseValue ?? 0),
        totalQuantity: Number(summary.totalQuantity ?? 0),
      },
      purchaseReport: purchaseReport.map((item) =>
        mapSupplierReportRow(item as Record<string, unknown>),
      ),
      topSuppliers: (Array.isArray(dto.topSuppliers) ? dto.topSuppliers : purchaseReport.slice(0, 8)).map(
        (item) => mapSupplierReportRow(item as Record<string, unknown>),
      ),
      performance: Array.isArray(dto.performance)
        ? dto.performance.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
    }
  },

  async getServiceReport(filters: ReportFilters = reportFilterDefaults): Promise<ServiceReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.services, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const rows = Array.isArray(dto.rows) ? dto.rows : []

    return {
      summary: {
        totalJobs: Number(summary.totalJobs ?? 0),
        completedJobs: Number(summary.completedJobs ?? 0),
        serviceRevenue: Number(summary.serviceRevenue ?? 0),
        averageJobValue: Number(summary.averageJobValue ?? 0),
      },
      revenueReport: Array.isArray(dto.revenueReport)
        ? dto.revenueReport.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      categoryReport: rows.map((item) => {
        const row = item as Record<string, unknown>
        return {
          categoryName: String(row.categoryName ?? 'General'),
          jobs: Number(row.jobs ?? 0),
          revenue: Number(row.revenue ?? 0),
        }
      }),
      technicianPerformance: Array.isArray(dto.technicianPerformance)
        ? dto.technicianPerformance.map((item) => {
            const row = item as Record<string, unknown>
            return {
              technician: String(row.technician ?? ''),
              jobs: Number(row.jobs ?? 0),
              revenue: Number(row.revenue ?? 0),
            }
          })
        : [],
      rows: rows.map((item) => {
        const row = item as Record<string, unknown>
        return {
          serviceName: String(row.serviceName ?? ''),
          jobs: Number(row.jobs ?? 0),
          revenue: Number(row.revenue ?? 0),
          categoryName: String(row.categoryName ?? 'General'),
        }
      }),
    }
  },

  async getUserReport(filters: ReportFilters = reportFilterDefaults): Promise<UserReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.users, {
      params: toReportQuery(filters),
    })
    const summary = (dto.summary ?? {}) as Record<string, unknown>
    const loginReport = Array.isArray(dto.loginReport) ? dto.loginReport : []
    const salesByUser = Array.isArray(dto.salesByUser) ? dto.salesByUser : []
    const inventoryActions = Array.isArray(dto.inventoryActions) ? dto.inventoryActions : []

    return {
      summary: {
        totalUsers: Number(summary.totalUsers ?? 0),
        activeUsers: Number(summary.activeUsers ?? 0),
        loginsThisMonth: Number(summary.loginsThisMonth ?? 0),
        totalActions: Number(summary.totalActions ?? 0),
      },
      loginReport: loginReport.map((item) => mapUserReportRow(item as Record<string, unknown>)),
      salesByUser: salesByUser.map((item) => mapUserReportRow(item as Record<string, unknown>)),
      inventoryActions: inventoryActions.map((item) =>
        mapUserReportRow(item as Record<string, unknown>),
      ),
      activitySummary: loginReport.map((item) => mapUserReportRow(item as Record<string, unknown>)),
    }
  },

  async getProfitLossReport(filters: ReportFilters = reportFilterDefaults): Promise<ProfitLossReportData> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.reports.profitLoss, {
      params: toReportQuery(filters),
    })

    return {
      totalRevenue: Number(dto.totalRevenue ?? 0),
      purchaseCosts: Number(dto.purchaseCosts ?? 0),
      serviceCosts: Number(dto.serviceCosts ?? 0),
      totalExpenses: Number(dto.totalExpenses ?? 0),
      grossProfit: Number(dto.grossProfit ?? 0),
      netProfit: Number(dto.netProfit ?? 0),
      revenueBreakdown: Array.isArray(dto.revenueBreakdown)
        ? dto.revenueBreakdown.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      expenseBreakdown: Array.isArray(dto.expenseBreakdown)
        ? dto.expenseBreakdown.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
      monthlyTrend: Array.isArray(dto.monthlyTrend)
        ? dto.monthlyTrend.map((item) => mapReportChartPoint(item as Record<string, unknown>))
        : [],
    }
  },
}
