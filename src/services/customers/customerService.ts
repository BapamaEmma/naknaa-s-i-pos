import type { PaymentMethod } from '@/features/sales/types'
import type {
  CreateCustomerInput,
  Customer,
  CustomerDashboardSummary,
  CustomerDetail,
  CustomerListFilters,
  CustomerListItem,
  CustomerListResult,
  CustomerOption,
  CustomerPurchase,
  CustomerPurchaseFilters,
  CustomerPurchaseHistoryResult,
  CustomerStats,
  TopPurchasedProduct,
  UpdateCustomerInput,
} from '@/features/customers/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import { fromPaymentMethod } from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function mapCustomerListItem(dto: Record<string, unknown>): CustomerListItem {
  return {
    id: String(dto.id),
    customerCode: String(dto.customerCode ?? ''),
    fullName: String(dto.customerName ?? dto.fullName ?? ''),
    phoneNumber: String(dto.phoneNumber ?? ''),
    email: String(dto.email ?? ''),
    address: String(dto.address ?? ''),
    city: String(dto.city ?? ''),
    notes: String(dto.notes ?? ''),
    registrationDate: String(dto.createdAt ?? dto.registrationDate ?? new Date().toISOString()),
    status: dto.isActive === false || dto.status === 'inactive' ? 'inactive' : 'active',
    totalPurchases: Number(dto.totalPurchases ?? 0),
    totalAmountSpent: Number(dto.totalAmountSpent ?? 0),
  }
}

function mapCustomerStats(dto: Record<string, unknown>): CustomerStats {
  return {
    totalPurchases: Number(dto.totalPurchases ?? 0),
    totalAmountSpent: Number(dto.totalAmountSpent ?? 0),
    lastPurchaseDate: dto.lastPurchaseDate ? String(dto.lastPurchaseDate) : null,
    averagePurchaseValue: Number(dto.averagePurchaseValue ?? 0),
  }
}

function mapTopPurchasedProduct(dto: Record<string, unknown>): TopPurchasedProduct {
  return {
    rank: Number(dto.rank ?? 0),
    productName: String(dto.productName ?? ''),
    variantName: String(dto.variantName ?? ''),
    purchaseCount: Number(dto.purchaseCount ?? 0),
  }
}

function mapCustomerPurchase(dto: Record<string, unknown>): CustomerPurchase {
  const paymentMethod = dto.paymentMethod
  return {
    id: String(dto.id),
    saleId: String(dto.saleId),
    receiptNumber: String(dto.receiptNumber ?? ''),
    saleDate: String(dto.saleDate ?? new Date().toISOString()),
    itemsPurchased: Number(dto.itemsPurchased ?? 0),
    itemSummary: String(dto.itemSummary ?? ''),
    paymentMethod:
      typeof paymentMethod === 'number' || typeof paymentMethod === 'string'
        ? fromPaymentMethod(paymentMethod)
        : (String(paymentMethod ?? 'cash').toLowerCase().replace(' ', '_') as PaymentMethod),
    totalAmount: Number(dto.totalAmount ?? 0),
  }
}

function mapCustomerDetail(dto: Record<string, unknown>): CustomerDetail {
  const base = mapCustomerListItem(dto)
  const stats = mapCustomerStats((dto.stats as Record<string, unknown>) ?? {})
  const topProducts = Array.isArray(dto.topProducts)
    ? dto.topProducts.map((item) => mapTopPurchasedProduct(item as Record<string, unknown>))
    : []
  const recentPurchases = Array.isArray(dto.recentPurchases)
    ? dto.recentPurchases.map((item) => mapCustomerPurchase(item as Record<string, unknown>))
    : []

  return { ...base, stats, topProducts, recentPurchases }
}

function mapCustomerOption(dto: Record<string, unknown>): CustomerOption {
  return {
    id: String(dto.id),
    name: String(dto.name ?? dto.customerName ?? ''),
    phone: String(dto.phone ?? dto.phoneNumber ?? ''),
  }
}

function buildCustomerQueryParams(filters: CustomerListFilters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.status === 'active') {
    params.isActive = true
  } else if (filters.status === 'inactive') {
    params.isActive = false
  }

  return params
}

function buildPurchaseQueryParams(filters: CustomerPurchaseFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.dateFrom) {
    params.dateFrom = filters.dateFrom
  }

  if (filters.dateTo) {
    params.dateTo = filters.dateTo
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    params.paymentMethod = filters.paymentMethod
  }

  return params
}

function toCreateCustomerPayload(input: CreateCustomerInput) {
  return {
    customerName: input.fullName,
    phoneNumber: input.phoneNumber,
    address: input.address || undefined,
    isActive: input.status !== 'inactive',
  }
}

function toUpdateCustomerPayload(input: UpdateCustomerInput, current: Customer) {
  return {
    customerName: input.fullName ?? current.fullName,
    phoneNumber: input.phoneNumber ?? current.phoneNumber,
    address: input.address ?? current.address,
    isActive: (input.status ?? current.status) !== 'inactive',
  }
}

export const customerService = {
  async getCustomers(filters: CustomerListFilters = {}): Promise<CustomerListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.customers, {
      params: buildCustomerQueryParams(filters),
    })

    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapCustomerListItem(item)),
      meta: paged.meta,
    }
  },

  async getCustomerSummary(): Promise<CustomerDashboardSummary> {
    const result = await apiGet<Record<string, unknown>>(`${API_ENDPOINTS.customers}/summary`)

    return {
      totalCustomers: Number(result.totalCustomers ?? 0),
      newCustomersThisMonth: Number(result.newCustomersThisMonth ?? 0),
      topCustomers: Array.isArray(result.topCustomers)
        ? result.topCustomers.map((item) => {
            const dto = item as Record<string, unknown>
            return {
              id: String(dto.id),
              customerCode: String(dto.customerCode ?? ''),
              fullName: String(dto.customerName ?? dto.fullName ?? ''),
              totalPurchases: Number(dto.totalPurchases ?? 0),
            }
          })
        : [],
      highestSpendingCustomers: Array.isArray(result.highestSpendingCustomers)
        ? result.highestSpendingCustomers.map((item) => {
            const dto = item as Record<string, unknown>
            return {
              id: String(dto.id),
              customerCode: String(dto.customerCode ?? ''),
              fullName: String(dto.customerName ?? dto.fullName ?? ''),
              totalAmountSpent: Number(dto.totalAmountSpent ?? 0),
            }
          })
        : [],
    }
  },

  async getCustomerById(id: string): Promise<CustomerDetail | null> {
    const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.customer(id))
    return mapCustomerDetail(result)
  },

  async getCustomerOptions(): Promise<CustomerOption[]> {
    const result = await apiGet<Record<string, unknown>[]>(API_ENDPOINTS.customerOptions)
    return result.map((item) => mapCustomerOption(item))
  },

  async createCustomer(input: CreateCustomerInput): Promise<CustomerDetail> {
    const result = await apiPost<Record<string, unknown>>(
      API_ENDPOINTS.customers,
      toCreateCustomerPayload(input),
    )
    return mapCustomerDetail(result)
  },

  async createQuickCustomer(fullName: string, phoneNumber: string): Promise<Customer> {
    const result = await apiPost<Record<string, unknown>>(API_ENDPOINTS.customers, {
      customerName: fullName,
      phoneNumber,
      isActive: true,
    })
    return mapCustomerListItem(result)
  },

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerDetail> {
    const existing = await apiGet<Record<string, unknown>>(API_ENDPOINTS.customer(id))
    const current = mapCustomerListItem(existing)

    const result = await apiPut<Record<string, unknown>>(
      API_ENDPOINTS.customer(id),
      toUpdateCustomerPayload(input, current),
    )
    return mapCustomerDetail(result)
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.customer(id))
  },

  async getCustomerPurchases(
    customerId: string,
    filters: CustomerPurchaseFilters = {},
  ): Promise<CustomerPurchaseHistoryResult> {
    const result = await apiGet<Record<string, unknown>>(
      `${API_ENDPOINTS.customer(customerId)}/purchases`,
      { params: buildPurchaseQueryParams(filters) },
    )

    const summary = (result.summary as Record<string, unknown>) ?? {}
    const purchases = Array.isArray(result.purchases)
      ? result.purchases.map((item) => mapCustomerPurchase(item as Record<string, unknown>))
      : []
    const topProducts = Array.isArray(result.topProducts)
      ? result.topProducts.map((item) => mapTopPurchasedProduct(item as Record<string, unknown>))
      : []

    return {
      purchases,
      summary: {
        totalPurchases: Number(summary.totalPurchases ?? 0),
        totalRevenue: Number(summary.totalRevenue ?? 0),
        averageOrderValue: Number(summary.averageOrderValue ?? 0),
      },
      topProducts,
      meta: {
        page: Number(result.page ?? filters.page ?? 1),
        limit: Number(result.pageSize ?? filters.limit ?? 10),
        total: Number(result.totalCount ?? purchases.length),
        totalPages: Number(result.totalPages ?? 1),
      },
    }
  },
}

export function getCustomerDisplayName(_customerId: string | null): string | null {
  return null
}

export function getCustomerPhone(_customerId: string | null): string | null {
  return null
}
