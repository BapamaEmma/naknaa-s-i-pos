import type {
  Branch,
  InventoryAdjustmentInput,
  InventoryDashboardSummary,
  InventoryHistoryFilters,
  InventoryHistoryResult,
  InventoryListFilters,
  InventoryListItem,
  InventoryListResult,
  InventoryRecord,
  InventoryStatus,
  InventoryTransaction,
  ProductOption,
  StockInInput,
  StockOutInput,
  SaleStockDeductionInput,
  VariantOption,
} from '@/features/inventory/types'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'
import { CATEGORY_STORAGE_KEY, SEED_CATEGORIES } from '@/services/categories/mock-data'
import {
  BRANCHES_STORAGE_KEY,
  INVENTORY_STORAGE_KEY,
  INVENTORY_TRANSACTIONS_KEY,
  SEED_BRANCHES,
  SEED_INVENTORY,
  SEED_TRANSACTIONS,
} from '@/services/inventory/mock-data'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'

function loadInventory(): InventoryRecord[] {
  return readStorage(INVENTORY_STORAGE_KEY, SEED_INVENTORY)
}

function saveInventory(records: InventoryRecord[]): void {
  writeStorage(INVENTORY_STORAGE_KEY, records)
}

function loadTransactions(): InventoryTransaction[] {
  return readStorage(INVENTORY_TRANSACTIONS_KEY, SEED_TRANSACTIONS)
}

function saveTransactions(transactions: InventoryTransaction[]): void {
  writeStorage(INVENTORY_TRANSACTIONS_KEY, transactions)
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

function loadBranches(): Branch[] {
  return readStorage(BRANCHES_STORAGE_KEY, SEED_BRANCHES)
}

function getStatus(quantity: number, minimumStockLevel: number): InventoryStatus {
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= minimumStockLevel) return 'low_stock'
  return 'in_stock'
}

function generateReferenceNumber(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.floor(Math.random() * 900 + 100)
  return `INV-${stamp}-${suffix}`
}

function syncVariantStock(productVariantId: string, quantity: number, minimumStockLevel: number): void {
  const variants = loadVariants()
  const index = variants.findIndex((variant) => variant.id === productVariantId)
  if (index === -1) return

  variants[index] = {
    ...variants[index],
    currentStock: quantity,
    minimumStock: minimumStockLevel,
    updatedAt: new Date().toISOString(),
  }

  writeStorage(MOCK_STORAGE_KEYS.VARIANTS, variants)
}

function enrichInventoryRecord(record: InventoryRecord): InventoryListItem | null {
  const variant = loadVariants().find((entry) => entry.id === record.productVariantId)
  const product = variant ? loadProducts().find((entry) => entry.id === variant.productId) : null
  const category = product ? loadCategories().find((entry) => entry.id === product.categoryId) : null
  const branch = loadBranches().find((entry) => entry.id === record.branchId)

  if (!variant || !product || !branch) return null

  return {
    ...record,
    productId: product.id,
    productName: product.name,
    variantName: variant.name,
    variantType: variant.variantType,
    categoryId: product.categoryId,
    categoryName: category?.name ?? 'Unknown',
    brand: product.brand,
    sku: product.sku,
    branchName: branch.name,
    unitCost: variant.costPrice,
    status: getStatus(record.quantity, record.minimumStockLevel),
    stockValue: record.quantity * variant.costPrice,
  }
}

function findOrCreateInventoryRecord(
  branchId: string,
  productVariantId: string,
): InventoryRecord {
  const records = loadInventory()
  const existing = records.find(
    (record) => record.branchId === branchId && record.productVariantId === productVariantId,
  )

  if (existing) return existing

  const variant = loadVariants().find((entry) => entry.id === productVariantId)
  const created: InventoryRecord = {
    id: `inv-${productVariantId}-${branchId}`,
    branchId,
    productVariantId,
    quantity: 0,
    minimumStockLevel: variant?.minimumStock ?? 0,
    lastUpdated: new Date().toISOString(),
  }

  saveInventory([created, ...records])
  return created
}

function appendTransaction(
  record: InventoryRecord,
  input: {
    transactionType: InventoryTransaction['transactionType']
    quantity: number
    previousQuantity: number
    newQuantity: number
    unitCost?: number
    supplier?: string
    reason?: string
    notes?: string
    userId: string
    userName: string
  },
): InventoryTransaction {
  const enriched = enrichInventoryRecord(record)
  if (!enriched) {
    throw new Error('Unable to resolve inventory item details')
  }

  const transaction: InventoryTransaction = {
    id: crypto.randomUUID(),
    inventoryId: record.id,
    branchId: record.branchId,
    productId: enriched.productId,
    productVariantId: record.productVariantId,
    productName: enriched.productName,
    variantName: enriched.variantName,
    branchName: enriched.branchName,
    transactionType: input.transactionType,
    quantity: input.quantity,
    previousQuantity: input.previousQuantity,
    newQuantity: input.newQuantity,
    unitCost: input.unitCost,
    supplier: input.supplier,
    reason: input.reason,
    notes: input.notes,
    userId: input.userId,
    userName: input.userName,
    referenceNumber: generateReferenceNumber(),
    createdAt: new Date().toISOString(),
  }

  saveTransactions([transaction, ...loadTransactions()])
  return transaction
}

function updateInventoryRecord(record: InventoryRecord, quantity: number): InventoryRecord {
  const records = loadInventory()
  const index = records.findIndex((entry) => entry.id === record.id)
  const updated: InventoryRecord = {
    ...record,
    quantity,
    lastUpdated: new Date().toISOString(),
  }

  if (index === -1) {
    saveInventory([updated, ...records])
  } else {
    records[index] = updated
    saveInventory(records)
  }

  if (record.branchId === DEFAULT_BRANCH_ID) {
    syncVariantStock(record.productVariantId, quantity, record.minimumStockLevel)
  }

  return updated
}

function filterInventoryItems(
  items: InventoryListItem[],
  filters: InventoryListFilters,
): InventoryListItem[] {
  const search = filters.search?.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      item.productName.toLowerCase().includes(search) ||
      item.variantName.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search) ||
      item.brand.toLowerCase().includes(search)

    const matchesCategory = !filters.categoryId || item.categoryId === filters.categoryId
    const matchesBranch = !filters.branchId || item.branchId === filters.branchId
    const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status

    return matchesSearch && matchesCategory && matchesBranch && matchesStatus
  })
}

export const inventoryService = {
  async getBranches(): Promise<Branch[]> {
    await delay(150)
    return loadBranches().filter((branch) => branch.isActive)
  },

  async getProductOptions(): Promise<ProductOption[]> {
    await delay(150)
    return loadProducts()
      .filter((product) => product.isActive)
      .map((product) => ({ id: product.id, name: product.name, sku: product.sku }))
      .sort((left, right) => left.name.localeCompare(right.name))
  },

  async getVariantOptions(productId: string, branchId?: string): Promise<VariantOption[]> {
    await delay(150)
    const inventory = loadInventory()

    return loadVariants()
      .filter((variant) => variant.productId === productId && variant.isActive)
      .map((variant) => {
        const record = inventory.find(
          (entry) =>
            entry.productVariantId === variant.id &&
            (!branchId || entry.branchId === branchId),
        )

        return {
          id: variant.id,
          productId: variant.productId,
          name: variant.name,
          currentQuantity: record?.quantity ?? 0,
          minimumStock: record?.minimumStockLevel ?? variant.minimumStock,
          unitCost: variant.costPrice,
        }
      })
  },

  async getInventorySummary(): Promise<InventoryDashboardSummary> {
    await delay(200)

    const items = loadInventory()
      .map(enrichInventoryRecord)
      .filter((item): item is InventoryListItem => Boolean(item))

    const uniqueProducts = new Set(items.map((item) => item.productId))

    return {
      totalProducts: uniqueProducts.size,
      totalStockQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      inventoryValue: items.reduce((sum, item) => sum + item.stockValue, 0),
      lowStockProducts: items.filter((item) => item.status === 'low_stock').length,
      outOfStockProducts: items.filter((item) => item.status === 'out_of_stock').length,
    }
  },

  async getInventory(filters: InventoryListFilters = {}): Promise<InventoryListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const items = loadInventory()
      .map(enrichInventoryRecord)
      .filter((item): item is InventoryListItem => Boolean(item))

    const filtered = filterInventoryItems(items, filters)
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async getInventoryById(id: string): Promise<InventoryListItem | null> {
    await delay(150)
    const record = loadInventory().find((entry) => entry.id === id)
    return record ? enrichInventoryRecord(record) : null
  },

  async getLowStockProducts(filters: InventoryListFilters = {}): Promise<InventoryListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const items = loadInventory()
      .map(enrichInventoryRecord)
      .filter((item): item is InventoryListItem => Boolean(item))
      .filter((item) => item.status === 'low_stock' || item.status === 'out_of_stock')

    const filtered = filterInventoryItems(items, { ...filters, status: 'all' })
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async getInventoryHistory(filters: InventoryHistoryFilters = {}): Promise<InventoryHistoryResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const search = filters.search?.trim().toLowerCase()

    let transactions = loadTransactions()

    transactions = transactions.filter((transaction) => {
      const matchesSearch =
        !search ||
        transaction.productName.toLowerCase().includes(search) ||
        transaction.variantName.toLowerCase().includes(search) ||
        transaction.referenceNumber.toLowerCase().includes(search) ||
        transaction.userName.toLowerCase().includes(search)

      const matchesBranch = !filters.branchId || transaction.branchId === filters.branchId
      const matchesProduct = !filters.productId || transaction.productId === filters.productId
      const matchesType =
        !filters.transactionType ||
        filters.transactionType === 'all' ||
        transaction.transactionType === filters.transactionType

      const created = new Date(transaction.createdAt)
      const matchesFrom = !filters.dateFrom || created >= new Date(filters.dateFrom)
      const matchesTo = !filters.dateTo || created <= new Date(`${filters.dateTo}T23:59:59`)

      return matchesSearch && matchesBranch && matchesProduct && matchesType && matchesFrom && matchesTo
    })

    const total = transactions.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: transactions.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async stockIn(input: StockInInput): Promise<InventoryTransaction> {
    await delay()

    const record = findOrCreateInventoryRecord(input.branchId, input.productVariantId)
    const newQuantity = record.quantity + input.quantity
    const updated = updateInventoryRecord(record, newQuantity)

    const variant = loadVariants().find((entry) => entry.id === input.productVariantId)
    if (variant && input.unitCost > 0) {
      const variants = loadVariants()
      const index = variants.findIndex((entry) => entry.id === input.productVariantId)
      if (index !== -1) {
        variants[index] = { ...variants[index], costPrice: input.unitCost, updatedAt: new Date().toISOString() }
        writeStorage(MOCK_STORAGE_KEYS.VARIANTS, variants)
      }
    }

    return appendTransaction(updated, {
      transactionType: 'stock_in',
      quantity: input.quantity,
      previousQuantity: record.quantity,
      newQuantity,
      unitCost: input.unitCost,
      supplier: input.supplier,
      notes: input.notes,
      userId: input.userId,
      userName: input.userName,
    })
  },

  async stockOut(input: StockOutInput): Promise<InventoryTransaction> {
    await delay()

    const record = findOrCreateInventoryRecord(input.branchId, input.productVariantId)

    if (record.quantity < input.quantity) {
      throw new Error('Insufficient stock for this operation.')
    }

    const newQuantity = record.quantity - input.quantity
    const updated = updateInventoryRecord(record, newQuantity)

    return appendTransaction(updated, {
      transactionType: 'stock_out',
      quantity: input.quantity,
      previousQuantity: record.quantity,
      newQuantity,
      reason: input.reason,
      notes: input.notes,
      userId: input.userId,
      userName: input.userName,
    })
  },

  async adjustInventory(input: InventoryAdjustmentInput): Promise<InventoryTransaction> {
    await delay()

    const record = findOrCreateInventoryRecord(input.branchId, input.productVariantId)
    const difference = Math.abs(input.newQuantity - record.quantity)
    const updated = updateInventoryRecord(record, input.newQuantity)

    return appendTransaction(updated, {
      transactionType: 'adjustment',
      quantity: difference,
      previousQuantity: record.quantity,
      newQuantity: input.newQuantity,
      reason: input.reason,
      userId: input.userId,
      userName: input.userName,
    })
  },

  async deductForSale(input: SaleStockDeductionInput): Promise<InventoryTransaction> {
    await delay(100)

    const record = findOrCreateInventoryRecord(input.branchId, input.productVariantId)

    if (record.quantity < input.quantity) {
      throw new Error(`Insufficient stock for sale (${input.receiptNumber}).`)
    }

    const newQuantity = record.quantity - input.quantity
    const updated = updateInventoryRecord(record, newQuantity)

    return appendTransaction(updated, {
      transactionType: 'sale',
      quantity: input.quantity,
      previousQuantity: record.quantity,
      newQuantity,
      reason: 'Sale',
      notes: `Receipt: ${input.receiptNumber}`,
      userId: input.userId,
      userName: input.userName,
    })
  },
}
