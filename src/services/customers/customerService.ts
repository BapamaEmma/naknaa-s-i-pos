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
import {
  CUSTOMER_CODE_COUNTER_KEY,
  CUSTOMERS_STORAGE_KEY,
  SEED_CUSTOMER_CODE_COUNTER,
  SEED_CUSTOMERS,
} from '@/services/customers/mock-data'
import {
  SALE_ITEMS_STORAGE_KEY,
  SALES_STORAGE_KEY,
  SEED_SALE_ITEMS,
  SEED_SALES,
} from '@/services/sales/mock-data'
import type { Sale, SaleItem } from '@/features/sales/types'
import { delay, readStorage, writeStorage } from '@/services/products/storage'

function loadCustomers(): Customer[] {
  return readStorage(CUSTOMERS_STORAGE_KEY, SEED_CUSTOMERS)
}

function saveCustomers(customers: Customer[]): void {
  writeStorage(CUSTOMERS_STORAGE_KEY, customers)
}

function loadCounter(): number {
  return readStorage(CUSTOMER_CODE_COUNTER_KEY, SEED_CUSTOMER_CODE_COUNTER)
}

function saveCounter(value: number): void {
  writeStorage(CUSTOMER_CODE_COUNTER_KEY, value)
}

function loadSales(): Sale[] {
  return readStorage(SALES_STORAGE_KEY, SEED_SALES)
}

function loadSaleItems(): SaleItem[] {
  return readStorage(SALE_ITEMS_STORAGE_KEY, SEED_SALE_ITEMS)
}

function generateCustomerCode(): string {
  const next = loadCounter() + 1
  saveCounter(next)
  return `CUS-${String(next).padStart(6, '0')}`
}

function isNewCustomer(customer: Customer): boolean {
  const registered = new Date(customer.registrationDate)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return registered >= thirtyDaysAgo
}

function getCustomerSales(customerId: string): Sale[] {
  return loadSales().filter(
    (sale) => sale.customerId === customerId && sale.status === 'completed',
  )
}

function buildPurchaseRecord(sale: Sale, items: SaleItem[]): CustomerPurchase {
  const saleItems = items.filter((item) => item.saleId === sale.id)
  const itemSummary = saleItems
    .slice(0, 2)
    .map((item) => `${item.productName} (${item.variantName})`)
    .join(', ')

  return {
    id: `purchase-${sale.id}`,
    saleId: sale.id,
    receiptNumber: sale.receiptNumber,
    saleDate: sale.saleDate,
    itemsPurchased: saleItems.reduce((sum, item) => sum + item.quantity, 0),
    itemSummary: itemSummary || 'No items',
    paymentMethod: sale.paymentMethod,
    totalAmount: sale.totalAmount,
  }
}

function buildCustomerStats(customerId: string): CustomerStats {
  const sales = getCustomerSales(customerId)
  const totalPurchases = sales.length
  const totalAmountSpent = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const lastPurchaseDate =
    sales.length > 0
      ? sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0]
          .saleDate
      : null

  return {
    totalPurchases,
    totalAmountSpent,
    lastPurchaseDate,
    averagePurchaseValue: totalPurchases > 0 ? totalAmountSpent / totalPurchases : 0,
  }
}

function buildTopProducts(customerId: string): TopPurchasedProduct[] {
  const sales = getCustomerSales(customerId)
  const saleIds = new Set(sales.map((sale) => sale.id))
  const items = loadSaleItems().filter((item) => saleIds.has(item.saleId))

  const counts = new Map<string, { productName: string; variantName: string; count: number }>()

  for (const item of items) {
    const key = `${item.productName}::${item.variantName}`
    const existing = counts.get(key)
    if (existing) {
      existing.count += item.quantity
    } else {
      counts.set(key, {
        productName: item.productName,
        variantName: item.variantName,
        count: item.quantity,
      })
    }
  }

  return [...counts.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
    .map((entry, index) => ({
      rank: index + 1,
      productName: entry.productName,
      variantName: entry.variantName,
      purchaseCount: entry.count,
    }))
}

function enrichListItem(customer: Customer): CustomerListItem {
  const stats = buildCustomerStats(customer.id)
  return {
    ...customer,
    totalPurchases: stats.totalPurchases,
    totalAmountSpent: stats.totalAmountSpent,
  }
}

function filterCustomers(customers: Customer[], filters: CustomerListFilters): Customer[] {
  const search = filters.search?.trim().toLowerCase()

  return customers.filter((customer) => {
    const matchesSearch =
      !search ||
      customer.fullName.toLowerCase().includes(search) ||
      customer.phoneNumber.toLowerCase().includes(search) ||
      customer.customerCode.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search)

    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      (filters.status === 'new' ? isNewCustomer(customer) && customer.status === 'active' : customer.status === filters.status)

    return matchesSearch && matchesStatus
  })
}

function filterPurchases(
  purchases: CustomerPurchase[],
  filters: CustomerPurchaseFilters,
): CustomerPurchase[] {
  return purchases.filter((purchase) => {
    const saleDate = new Date(purchase.saleDate)
    const matchesFrom = !filters.dateFrom || saleDate >= new Date(filters.dateFrom)
    const matchesTo = !filters.dateTo || saleDate <= new Date(`${filters.dateTo}T23:59:59`)
    const matchesPayment =
      !filters.paymentMethod ||
      filters.paymentMethod === 'all' ||
      purchase.paymentMethod === filters.paymentMethod

    return matchesFrom && matchesTo && matchesPayment
  })
}

export const customerService = {
  async getCustomers(filters: CustomerListFilters = {}): Promise<CustomerListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterCustomers(loadCustomers(), filters).sort(
      (left, right) => new Date(right.registrationDate).getTime() - new Date(left.registrationDate).getTime(),
    )

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit).map(enrichListItem),
      meta: { page, limit, total, totalPages },
    }
  },

  async getCustomerSummary(): Promise<CustomerDashboardSummary> {
    await delay(150)

    const customers = loadCustomers()
    const enriched = customers.map(enrichListItem)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newCustomersThisMonth = customers.filter(
      (customer) => new Date(customer.registrationDate) >= startOfMonth,
    ).length

    const topCustomers = [...enriched]
      .sort((left, right) => right.totalPurchases - left.totalPurchases)
      .slice(0, 5)
      .map((customer) => ({
        id: customer.id,
        customerCode: customer.customerCode,
        fullName: customer.fullName,
        totalPurchases: customer.totalPurchases,
      }))

    const highestSpendingCustomers = [...enriched]
      .sort((left, right) => right.totalAmountSpent - left.totalAmountSpent)
      .slice(0, 5)
      .map((customer) => ({
        id: customer.id,
        customerCode: customer.customerCode,
        fullName: customer.fullName,
        totalAmountSpent: customer.totalAmountSpent,
      }))

    return {
      totalCustomers: customers.length,
      newCustomersThisMonth,
      topCustomers,
      highestSpendingCustomers,
    }
  },

  async getCustomerById(id: string): Promise<CustomerDetail | null> {
    await delay(150)

    const customer = loadCustomers().find((entry) => entry.id === id)
    if (!customer) return null

    const sales = getCustomerSales(id).sort(
      (left, right) => new Date(right.saleDate).getTime() - new Date(left.saleDate).getTime(),
    )
    const items = loadSaleItems()

    return {
      ...customer,
      stats: buildCustomerStats(id),
      topProducts: buildTopProducts(id),
      recentPurchases: sales.slice(0, 5).map((sale) => buildPurchaseRecord(sale, items)),
    }
  },

  async getCustomerOptions(): Promise<CustomerOption[]> {
    await delay(100)

    return loadCustomers()
      .filter((customer) => customer.status === 'active')
      .map((customer) => ({
        id: customer.id,
        name: customer.fullName,
        phone: customer.phoneNumber,
      }))
      .sort((left, right) => left.name.localeCompare(right.name))
  },

  async createCustomer(input: CreateCustomerInput): Promise<CustomerDetail> {
    await delay()

    const customer: Customer = {
      id: crypto.randomUUID(),
      customerCode: generateCustomerCode(),
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      email: input.email ?? '',
      address: input.address ?? '',
      city: input.city ?? '',
      notes: input.notes ?? '',
      registrationDate: new Date().toISOString(),
      status: input.status ?? 'active',
    }

    saveCustomers([customer, ...loadCustomers()])
    return (await this.getCustomerById(customer.id))!
  },

  async createQuickCustomer(fullName: string, phoneNumber: string): Promise<Customer> {
    await delay(100)

    const customer: Customer = {
      id: crypto.randomUUID(),
      customerCode: generateCustomerCode(),
      fullName,
      phoneNumber,
      email: '',
      address: '',
      city: '',
      notes: 'Created from POS checkout.',
      registrationDate: new Date().toISOString(),
      status: 'active',
    }

    saveCustomers([customer, ...loadCustomers()])
    return customer
  },

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerDetail> {
    await delay()

    const customers = loadCustomers()
    const index = customers.findIndex((entry) => entry.id === id)
    if (index === -1) throw new Error('Customer not found.')

    customers[index] = { ...customers[index], ...input }
    saveCustomers(customers)

    return (await this.getCustomerById(id))!
  },

  async deleteCustomer(id: string): Promise<void> {
    await delay()

    const sales = getCustomerSales(id)
    if (sales.length > 0) {
      throw new Error('Cannot delete a customer with purchase history.')
    }

    const customers = loadCustomers().filter((entry) => entry.id !== id)
    if (customers.length === loadCustomers().length) {
      throw new Error('Customer not found.')
    }

    saveCustomers(customers)
  },

  async getCustomerPurchases(
    customerId: string,
    filters: CustomerPurchaseFilters = {},
  ): Promise<CustomerPurchaseHistoryResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const sales = getCustomerSales(customerId).sort(
      (left, right) => new Date(right.saleDate).getTime() - new Date(left.saleDate).getTime(),
    )
    const items = loadSaleItems()
    const purchases = sales.map((sale) => buildPurchaseRecord(sale, items))
    const filtered = filterPurchases(purchases, filters)

    const totalRevenue = filtered.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const totalPurchases = filtered.length

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      purchases: filtered.slice(start, start + limit),
      summary: {
        totalPurchases,
        totalRevenue,
        averageOrderValue: totalPurchases > 0 ? totalRevenue / totalPurchases : 0,
      },
      topProducts: buildTopProducts(customerId),
      meta: { page, limit, total, totalPages },
    }
  },
}

export function getCustomerDisplayName(customerId: string | null): string | null {
  if (!customerId) return null
  const customer = loadCustomers().find((entry) => entry.id === customerId)
  return customer?.fullName ?? null
}

export function getCustomerPhone(customerId: string | null): string | null {
  if (!customerId) return null
  const customer = loadCustomers().find((entry) => entry.id === customerId)
  return customer?.phoneNumber ?? null
}
