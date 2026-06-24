import type {
  CashierOption,
  CreateSaleInput,
  PosProductResult,
  ReceiptData,
  SaleDetail,
  SalesDashboardSummary,
  SalesListFilters,
  SalesListResult,
} from '@/features/sales/types'
import { customerService } from '@/services/customers/customerService'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiGet, apiPost } from '@/services/api/http'
import {
  mapPagedSales,
  mapPosProduct,
  mapReceipt,
  mapSaleDetail,
  mapSalesSummary,
  toPaymentMethod,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

async function resolveCustomer(input: CreateSaleInput): Promise<{
  customerId: string | null
  customerName: string
  customerPhone: string
}> {
  if (input.customerId) {
    const customers = await customerService.getCustomerOptions()
    const existing = customers.find((customer) => customer.id === input.customerId)
    if (existing) {
      return {
        customerId: existing.id,
        customerName: existing.name,
        customerPhone: existing.phone,
      }
    }

    return {
      customerId: null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    }
  }

  if (input.customerName === 'Walk-In Customer') {
    return {
      customerId: null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    }
  }

  const created = await customerService.createQuickCustomer(input.customerName, input.customerPhone)
  return {
    customerId: created.id,
    customerName: created.fullName,
    customerPhone: created.phoneNumber,
  }
}

function buildSalesQueryParams(filters: SalesListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.dateFrom) {
    params.dateFrom = filters.dateFrom
  }

  if (filters.dateTo) {
    params.dateTo = filters.dateTo
  }

  if (filters.customerId) {
    params.customerId = filters.customerId
  }

  if (filters.cashierId) {
    params.userId = filters.cashierId
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    params.paymentMethod = toPaymentMethod(filters.paymentMethod)
  }

  return params
}

export const salesService = {
  async searchProducts(search: string, _branchId?: string): Promise<PosProductResult[]> {
    const result = await apiGet<Record<string, unknown>[]>(API_ENDPOINTS.salesProducts, {
      params: { query: search },
    })
    return result.map((item) => mapPosProduct(item))
  },

  async getCustomers() {
    return customerService.getCustomerOptions()
  },

  async getCashiers(): Promise<CashierOption[]> {
    try {
      const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.users, {
        params: { page: 1, pageSize: 100, isActive: true },
      })

      return result.items.map((user) => ({
        id: String(user.id),
        name: String(user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()),
      }))
    } catch {
      return []
    }
  },

  async getSalesSummary(): Promise<SalesDashboardSummary> {
    const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.salesSummary)
    return mapSalesSummary(result)
  },

  async getSales(filters: SalesListFilters = {}): Promise<SalesListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.sales, {
      params: buildSalesQueryParams(filters),
    })
    return mapPagedSales(result)
  },

  async getSaleById(id: string): Promise<SaleDetail | null> {
    const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.sale(id))
    return mapSaleDetail(result)
  },

  async getReceipt(id: string): Promise<ReceiptData | null> {
    const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.saleReceipt(id))
    return mapReceipt(result)
  },

  async reprintReceipt(id: string): Promise<ReceiptData | null> {
    return this.getReceipt(id)
  },

  async createSale(input: CreateSaleInput): Promise<SaleDetail> {
    if (input.items.length === 0) {
      throw new Error('Cart is empty. Add at least one product.')
    }

    const customer = await resolveCustomer(input)

    const result = await apiPost<Record<string, unknown>>(API_ENDPOINTS.sales, {
      branchId: input.branchId,
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      paymentMethod: toPaymentMethod(input.paymentMethod),
      discount: input.discount,
      items: input.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    })

    return mapSaleDetail(result)
  },
}
