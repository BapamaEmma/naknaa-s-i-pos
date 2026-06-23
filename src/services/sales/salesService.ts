import type {
  AuditLogEntry,
  CashierOption,
  CreateSaleInput,
  PosProductResult,
  ReceiptData,
  SaleDetail,
  SalesDashboardSummary,
  SalesListFilters,
  SalesListResult,
  SaleItem,
  Sale,
} from '@/features/sales/types'
import type { InventoryRecord } from '@/features/inventory/types'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'
import { customerService } from '@/services/customers/customerService'
import { userService } from '@/services/users/userService'
import { BRANCHES_STORAGE_KEY, INVENTORY_STORAGE_KEY, SEED_BRANCHES, SEED_INVENTORY } from '@/services/inventory/mock-data'
import { inventoryService } from '@/services/inventory/inventoryService'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'
import {
  AUDIT_LOGS_STORAGE_KEY,
  SALE_ITEMS_STORAGE_KEY,
  SALES_COUNTER_KEY,
  SALES_STORAGE_KEY,
  SEED_SALE_ITEMS,
  SEED_SALES,
  SEED_SALES_COUNTER,
} from '@/services/sales/mock-data'

function loadSales(): Sale[] {
  return readStorage(SALES_STORAGE_KEY, SEED_SALES)
}

function saveSales(sales: Sale[]): void {
  writeStorage(SALES_STORAGE_KEY, sales)
}

function loadSaleItems(): SaleItem[] {
  return readStorage(SALE_ITEMS_STORAGE_KEY, SEED_SALE_ITEMS)
}

function saveSaleItems(items: SaleItem[]): void {
  writeStorage(SALE_ITEMS_STORAGE_KEY, items)
}

function resolveCustomer(input: CreateSaleInput): Promise<{ customerId: string | null; customerName: string; customerPhone: string }> {
  if (input.customerId) {
    return customerService.getCustomerOptions().then((customers) => {
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
    })
  }

  if (input.customerName === 'Walk-In Customer') {
    return Promise.resolve({
      customerId: null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    })
  }

  return customerService.createQuickCustomer(input.customerName, input.customerPhone).then((created) => ({
    customerId: created.id,
    customerName: created.fullName,
    customerPhone: created.phoneNumber,
  }))
}

function loadCounter(): number {
  return readStorage(SALES_COUNTER_KEY, SEED_SALES_COUNTER)
}

function saveCounter(value: number): void {
  writeStorage(SALES_COUNTER_KEY, value)
}

function loadAuditLogs(): AuditLogEntry[] {
  return readStorage(AUDIT_LOGS_STORAGE_KEY, [])
}

function saveAuditLogs(logs: AuditLogEntry[]): void {
  writeStorage(AUDIT_LOGS_STORAGE_KEY, logs)
}

function loadInventory(): InventoryRecord[] {
  return readStorage(INVENTORY_STORAGE_KEY, SEED_INVENTORY)
}

function loadProducts() {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants() {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function loadBranches() {
  return readStorage(BRANCHES_STORAGE_KEY, SEED_BRANCHES)
}

function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const next = loadCounter() + 1
  saveCounter(next)
  return `NAK-${year}-${String(next).padStart(6, '0')}`
}

function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
  const log: AuditLogEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  }
  saveAuditLogs([log, ...loadAuditLogs()])
  return log
}

function getAvailableStock(branchId: string, productVariantId: string): number {
  const record = loadInventory().find(
    (entry) => entry.branchId === branchId && entry.productVariantId === productVariantId,
  )
  return record?.quantity ?? 0
}

function buildPosProductResults(search: string, branchId: string): PosProductResult[] {
  const query = search.trim().toLowerCase()
  const products = loadProducts().filter((product) => product.isActive)
  const variants = loadVariants().filter((variant) => variant.isActive)
  const results: PosProductResult[] = []

  for (const variant of variants) {
    const product = products.find((entry) => entry.id === variant.productId)
    if (!product) continue

    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)

    if (!matchesSearch) continue

    results.push({
      productId: product.id,
      productVariantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      brand: product.brand,
      sku: product.sku,
      imageUrl: product.imageUrl,
      sellingPrice: variant.sellingPrice,
      availableStock: getAvailableStock(branchId, variant.id),
    })
  }

  return results.sort((left, right) => left.productName.localeCompare(right.productName))
}

function filterSales(sales: Sale[], filters: SalesListFilters): Sale[] {
  const search = filters.search?.trim().toLowerCase()

  return sales.filter((sale) => {
    const matchesSearch =
      !search ||
      sale.receiptNumber.toLowerCase().includes(search) ||
      sale.customerName.toLowerCase().includes(search) ||
      sale.cashierName.toLowerCase().includes(search)

    const matchesCustomer = !filters.customerId || sale.customerId === filters.customerId
    const matchesCashier = !filters.cashierId || sale.cashierId === filters.cashierId
    const matchesPayment =
      !filters.paymentMethod ||
      filters.paymentMethod === 'all' ||
      sale.paymentMethod === filters.paymentMethod

    const saleDate = new Date(sale.saleDate)
    const matchesFrom = !filters.dateFrom || saleDate >= new Date(filters.dateFrom)
    const matchesTo = !filters.dateTo || saleDate <= new Date(`${filters.dateTo}T23:59:59`)

    return matchesSearch && matchesCustomer && matchesCashier && matchesPayment && matchesFrom && matchesTo
  })
}

function calculateSummary(sales: Sale[]): SalesDashboardSummary {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const completed = sales.filter((sale) => sale.status === 'completed')

  const todaySales = completed
    .filter((sale) => new Date(sale.saleDate) >= startOfDay)
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  const todayTransactions = completed.filter((sale) => new Date(sale.saleDate) >= startOfDay).length

  const weeklyRevenue = completed
    .filter((sale) => new Date(sale.saleDate) >= startOfWeek)
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  const monthlyRevenue = completed
    .filter((sale) => new Date(sale.saleDate) >= startOfMonth)
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  return {
    todaySales,
    todayTransactions,
    weeklyRevenue,
    monthlyRevenue,
  }
}

function buildSaleDetail(sale: Sale): SaleDetail {
  const items = loadSaleItems().filter((item) => item.saleId === sale.id)
  return { ...sale, items }
}

export const salesService = {
  async searchProducts(search: string, branchId: string = DEFAULT_BRANCH_ID): Promise<PosProductResult[]> {
    await delay(150)
    return buildPosProductResults(search, branchId)
  },

  async getCustomers() {
    await delay(100)
    return customerService.getCustomerOptions()
  },

  async getCashiers(): Promise<CashierOption[]> {
    await delay(100)
    const result = await userService.getUsers({ status: 'active', limit: 100 })

    return result.data
      .filter((user) => user.roleId === 'cashier' || user.roleId === 'administrator')
      .map((user) => ({
        id: user.id,
        name: user.fullName,
      }))
  },

  async getSalesSummary(): Promise<SalesDashboardSummary> {
    await delay(150)
    return calculateSummary(loadSales())
  },

  async getSales(filters: SalesListFilters = {}): Promise<SalesListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterSales(loadSales(), filters).sort(
      (left, right) => new Date(right.saleDate).getTime() - new Date(left.saleDate).getTime(),
    )

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async getSaleById(id: string): Promise<SaleDetail | null> {
    await delay(150)
    const sale = loadSales().find((entry) => entry.id === id)
    return sale ? buildSaleDetail(sale) : null
  },

  async getReceipt(id: string): Promise<ReceiptData | null> {
    await delay(100)
    return this.getSaleById(id)
  },

  async reprintReceipt(id: string): Promise<ReceiptData | null> {
    await delay(100)
    const receipt = await this.getSaleById(id)
    if (!receipt) return null

    appendAuditLog({
      action: 'reprint_receipt',
      entityType: 'sale',
      entityId: receipt.id,
      userId: 'system',
      userName: 'System',
      details: `Receipt ${receipt.receiptNumber} reprinted`,
    })

    return receipt
  },

  async createSale(input: CreateSaleInput): Promise<SaleDetail> {
    await delay()

    if (input.items.length === 0) {
      throw new Error('Cart is empty. Add at least one product.')
    }

    const branch = loadBranches().find((entry) => entry.id === input.branchId)
    if (!branch) {
      throw new Error('Invalid branch selected.')
    }

    const products = loadProducts()
    const variants = loadVariants()
    const saleItems: SaleItem[] = []
    let subtotal = 0

    for (const item of input.items) {
      const variant = variants.find((entry) => entry.id === item.productVariantId)
      if (!variant) {
        throw new Error('One or more products are no longer available.')
      }

      const product = products.find((entry) => entry.id === variant.productId)
      if (!product) {
        throw new Error('One or more products are no longer available.')
      }

      const available = getAvailableStock(input.branchId, item.productVariantId)
      if (item.quantity > available) {
        throw new Error(`Insufficient stock for ${product.name} (${variant.name}). Available: ${available}`)
      }

      const totalPrice = item.quantity * item.unitPrice
      subtotal += totalPrice

      saleItems.push({
        id: crypto.randomUUID(),
        saleId: '',
        productId: product.id,
        productVariantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      })
    }

    const discount = Math.min(input.discount, subtotal)
    const totalAmount = subtotal - discount
    const receiptNumber = generateReceiptNumber()
    const customer = await resolveCustomer(input)

    const sale: Sale = {
      id: crypto.randomUUID(),
      receiptNumber,
      branchId: branch.id,
      branchName: branch.name,
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      cashierId: input.cashierId,
      cashierName: input.cashierName,
      paymentMethod: input.paymentMethod,
      subtotal,
      discount,
      totalAmount,
      saleDate: new Date().toISOString(),
      status: 'completed',
    }

    const persistedItems = saleItems.map((item) => ({ ...item, saleId: sale.id }))
    saveSales([sale, ...loadSales()])
    saveSaleItems([...persistedItems, ...loadSaleItems()])

    for (const item of persistedItems) {
      await inventoryService.deductForSale({
        branchId: sale.branchId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        receiptNumber: sale.receiptNumber,
        userId: input.cashierId,
        userName: input.cashierName,
      })
    }

    appendAuditLog({
      action: 'create_sale',
      entityType: 'sale',
      entityId: sale.id,
      userId: input.cashierId,
      userName: input.cashierName,
      details: `Sale ${sale.receiptNumber} completed for ${formatCurrency(totalAmount)}`,
    })

    return buildSaleDetail(sale)
  },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount)
}
