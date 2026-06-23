import type { AuditLogEntry } from '@/features/sales/types'
import type {
  CreatePurchaseInput,
  CreatePurchaseOrderInput,
  Purchase,
  PurchaseDashboardSummary,
  PurchaseDetail,
  PurchaseItem,
  PurchaseListFilters,
  PurchaseListResult,
  PurchaseOrder,
  PurchaseReports,
  ReceivePurchaseInput,
  SupplierPurchaseHistoryItem,
  UpdatePurchaseInput,
  WarehousePurchaseSummaryItem,
} from '@/features/purchases/types'
import { DEFAULT_TAX_RATE } from '@/features/purchases/constants'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'
import { inventoryService } from '@/services/inventory/inventoryService'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { supplierService } from '@/services/suppliers/supplierService'
import { AUDIT_LOGS_STORAGE_KEY } from '@/services/sales/mock-data'
import {
  PURCHASE_COUNTER_KEY,
  PURCHASE_ITEMS_STORAGE_KEY,
  PURCHASE_ORDER_COUNTER_KEY,
  PURCHASE_ORDERS_STORAGE_KEY,
  PURCHASES_STORAGE_KEY,
  SEED_PURCHASE_COUNTER,
  SEED_PURCHASE_ITEMS,
  SEED_PURCHASE_ORDER_COUNTER,
  SEED_PURCHASE_ORDERS,
  SEED_PURCHASES,
} from '@/services/purchases/mock-data'
import {
  SEED_WAREHOUSES,
  WAREHOUSE_LOCATIONS_STORAGE_KEY,
  WAREHOUSE_STOCK_STORAGE_KEY,
  WAREHOUSES_STORAGE_KEY,
} from '@/services/warehouses/mock-data'
import type { WarehouseLocation, WarehouseStockRecord } from '@/features/warehouses/types'

function loadPurchases(): Purchase[] {
  return readStorage(PURCHASES_STORAGE_KEY, SEED_PURCHASES)
}

function savePurchases(purchases: Purchase[]): void {
  writeStorage(PURCHASES_STORAGE_KEY, purchases)
}

function loadPurchaseItems(): PurchaseItem[] {
  return readStorage(PURCHASE_ITEMS_STORAGE_KEY, SEED_PURCHASE_ITEMS)
}

function savePurchaseItems(items: PurchaseItem[]): void {
  writeStorage(PURCHASE_ITEMS_STORAGE_KEY, items)
}

function loadPurchaseOrders(): PurchaseOrder[] {
  return readStorage(PURCHASE_ORDERS_STORAGE_KEY, SEED_PURCHASE_ORDERS)
}

function savePurchaseOrders(orders: PurchaseOrder[]): void {
  writeStorage(PURCHASE_ORDERS_STORAGE_KEY, orders)
}

function loadProducts() {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants() {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function loadWarehouses() {
  return readStorage(WAREHOUSES_STORAGE_KEY, SEED_WAREHOUSES)
}

function loadLocations(): WarehouseLocation[] {
  return readStorage(WAREHOUSE_LOCATIONS_STORAGE_KEY, [])
}

function loadWarehouseStock(): WarehouseStockRecord[] {
  return readStorage(WAREHOUSE_STOCK_STORAGE_KEY, [])
}

function saveWarehouseStock(stock: WarehouseStockRecord[]): void {
  writeStorage(WAREHOUSE_STOCK_STORAGE_KEY, stock)
}

function loadAuditLogs(): AuditLogEntry[] {
  return readStorage(AUDIT_LOGS_STORAGE_KEY, [])
}

function saveAuditLogs(logs: AuditLogEntry[]): void {
  writeStorage(AUDIT_LOGS_STORAGE_KEY, logs)
}

function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): void {
  const log: AuditLogEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  }
  saveAuditLogs([log, ...loadAuditLogs()])
}

function generatePurchaseNumber(): string {
  const year = new Date().getFullYear()
  const next = readStorage(PURCHASE_COUNTER_KEY, SEED_PURCHASE_COUNTER) + 1
  writeStorage(PURCHASE_COUNTER_KEY, next)
  return `PUR-${year}-${String(next).padStart(6, '0')}`
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const next = readStorage(PURCHASE_ORDER_COUNTER_KEY, SEED_PURCHASE_ORDER_COUNTER) + 1
  writeStorage(PURCHASE_ORDER_COUNTER_KEY, next)
  return `PO-${year}-${String(next).padStart(6, '0')}`
}

function calculateTotals(items: { quantity: number; costPrice: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)
  const taxAmount = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100
  return { subtotal, taxAmount, totalAmount: subtotal + taxAmount }
}

function derivePurchaseStatus(items: PurchaseItem[]): Purchase['purchaseStatus'] {
  if (items.length === 0) return 'draft'
  const allReceived = items.every((item) => item.receivedQuantity >= item.quantity)
  const anyReceived = items.some((item) => item.receivedQuantity > 0)
  if (allReceived) return 'received'
  if (anyReceived) return 'partially_received'
  return 'ordered'
}

function filterPurchases(purchases: Purchase[], filters: PurchaseListFilters): Purchase[] {
  const search = filters.search?.trim().toLowerCase()

  return purchases.filter((purchase) => {
    if (search) {
      const haystack = [
        purchase.purchaseNumber,
        purchase.supplierName,
        purchase.invoiceNumber,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.warehouseId && filters.warehouseId !== 'all' && purchase.warehouseId !== filters.warehouseId) {
      return false
    }

    if (
      filters.purchaseStatus &&
      filters.purchaseStatus !== 'all' &&
      purchase.purchaseStatus !== filters.purchaseStatus
    ) {
      return false
    }

    if (
      filters.paymentStatus &&
      filters.paymentStatus !== 'all' &&
      purchase.paymentStatus !== filters.paymentStatus
    ) {
      return false
    }

    if (filters.dateFrom && purchase.purchaseDate < filters.dateFrom) return false
    if (filters.dateTo && purchase.purchaseDate > filters.dateTo) return false

    return true
  })
}

function findLocation(
  warehouseId: string,
  section: string,
  rack: string,
  bin: string,
): WarehouseLocation | null {
  const locations = loadLocations()
  return (
    locations.find(
      (entry) =>
        entry.warehouseId === warehouseId &&
        entry.section.toLowerCase() === section.toLowerCase() &&
        entry.rack.toLowerCase() === rack.toLowerCase() &&
        entry.bin.toLowerCase() === bin.toLowerCase(),
    ) ?? null
  )
}

async function updateWarehouseStockFromPurchase(
  item: PurchaseItem,
  purchase: Purchase,
  quantity: number,
): Promise<void> {
  const warehouse = loadWarehouses().find((entry) => entry.id === purchase.warehouseId)
  if (!warehouse) throw new Error('Warehouse not found')

  const product = loadProducts().find((entry) => entry.id === item.productId)
  const variant = loadVariants().find((entry) => entry.id === item.productVariantId)
  if (!product || !variant) throw new Error('Product variant not found')

  const location =
    findLocation(purchase.warehouseId, item.section, item.rack, item.bin) ??
    loadLocations().find((entry) => entry.warehouseId === purchase.warehouseId) ??
    null

  if (!location) throw new Error('Warehouse location not found')

  const stock = loadWarehouseStock()
  const existing = stock.find(
    (entry) =>
      entry.warehouseId === purchase.warehouseId &&
      entry.productVariantId === item.productVariantId &&
      entry.locationId === location.id,
  )

  if (existing) {
    existing.quantity += quantity
    existing.unitCost = item.costPrice
    existing.section = item.section
    existing.rack = item.rack
    existing.bin = item.bin
  } else {
    stock.push({
      id: crypto.randomUUID(),
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      locationId: location.id,
      section: item.section,
      rack: item.rack,
      bin: item.bin,
      productId: product.id,
      productName: product.name,
      productVariantId: variant.id,
      variantName: variant.name,
      brand: product.brand,
      color: variant.name,
      categoryId: product.categoryId,
      quantity,
      unitCost: item.costPrice,
    })
  }

  saveWarehouseStock(stock)
}

async function applyInventoryReceive(
  item: PurchaseItem,
  purchase: Purchase,
  quantity: number,
  userId: string,
  userName: string,
): Promise<void> {
  await inventoryService.stockIn({
    branchId: DEFAULT_BRANCH_ID,
    productId: item.productId,
    productVariantId: item.productVariantId,
    quantity,
    unitCost: item.costPrice,
    supplier: purchase.supplierName,
    notes: `Purchase receive ${purchase.purchaseNumber}`,
    userId,
    userName,
  })

  await updateWarehouseStockFromPurchase(item, purchase, quantity)
}

function enrichPurchaseDetail(purchase: Purchase): PurchaseDetail {
  const items = loadPurchaseItems().filter((item) => item.purchaseId === purchase.id)
  return { ...purchase, items }
}

export const purchaseService = {
  async getPurchases(filters: PurchaseListFilters = {}): Promise<PurchaseListResult> {
    await delay()
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterPurchases(loadPurchases(), filters).sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    )
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    }
  },

  async getPurchaseById(id: string): Promise<PurchaseDetail> {
    await delay()
    const purchase = loadPurchases().find((entry) => entry.id === id)
    if (!purchase) throw new Error('Purchase not found')
    return enrichPurchaseDetail(purchase)
  },

  async createPurchase(input: CreatePurchaseInput): Promise<PurchaseDetail> {
    await delay()

    const suppliers = await supplierService.getSupplierOptions()
    const supplier = suppliers.find((entry) => entry.id === input.supplierId)
    if (!supplier) throw new Error('Supplier is required')

    const warehouse = loadWarehouses().find((entry) => entry.id === input.warehouseId)
    if (!warehouse) throw new Error('Warehouse is required')

    const totals = calculateTotals(input.items)
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      purchaseNumber: generatePurchaseNumber(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      purchaseDate: input.purchaseDate,
      invoiceNumber: input.invoiceNumber,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      paymentStatus: input.paymentStatus,
      purchaseStatus: input.purchaseStatus,
      notes: input.notes,
      createdBy: input.userId,
      createdByName: input.userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const items: PurchaseItem[] = input.items.map((item) => ({
      id: crypto.randomUUID(),
      purchaseId: purchase.id,
      productId: item.productId,
      productName: item.productName,
      productVariantId: item.productVariantId,
      variantName: item.variantName,
      quantity: item.quantity,
      receivedQuantity: 0,
      costPrice: item.costPrice,
      totalCost: item.quantity * item.costPrice,
      section: item.section,
      rack: item.rack,
      bin: item.bin,
    }))

    savePurchases([purchase, ...loadPurchases()])
    savePurchaseItems([...items, ...loadPurchaseItems()])

    appendAuditLog({
      action: 'purchase_created',
      entityType: 'purchase',
      entityId: purchase.id,
      userId: input.userId,
      userName: input.userName,
      details: `Created purchase ${purchase.purchaseNumber} for ${supplier.name}`,
    })

    return enrichPurchaseDetail(purchase)
  },

  async updatePurchase(id: string, input: UpdatePurchaseInput): Promise<PurchaseDetail> {
    await delay()

    const purchases = loadPurchases()
    const index = purchases.findIndex((entry) => entry.id === id)
    if (index === -1) throw new Error('Purchase not found')

    const existing = purchases[index]
    if (existing.purchaseStatus === 'received') {
      throw new Error('Received purchases cannot be edited')
    }

    const suppliers = await supplierService.getSupplierOptions()
    const supplier = suppliers.find((entry) => entry.id === input.supplierId)
    if (!supplier) throw new Error('Supplier is required')

    const warehouse = loadWarehouses().find((entry) => entry.id === input.warehouseId)
    if (!warehouse) throw new Error('Warehouse is required')

    const totals = calculateTotals(input.items)
    const updated: Purchase = {
      ...existing,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      purchaseDate: input.purchaseDate,
      invoiceNumber: input.invoiceNumber,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      paymentStatus: input.paymentStatus,
      purchaseStatus: input.purchaseStatus,
      notes: input.notes,
      updatedAt: new Date().toISOString(),
    }

    const oldItems = loadPurchaseItems().filter((item) => item.purchaseId !== id)
    const items: PurchaseItem[] = input.items.map((item) => {
      const previous = loadPurchaseItems().find(
        (entry) =>
          entry.purchaseId === id && entry.productVariantId === item.productVariantId,
      )
      return {
        id: previous?.id ?? crypto.randomUUID(),
        purchaseId: id,
        productId: item.productId,
        productName: item.productName,
        productVariantId: item.productVariantId,
        variantName: item.variantName,
        quantity: item.quantity,
        receivedQuantity: previous?.receivedQuantity ?? 0,
        costPrice: item.costPrice,
        totalCost: item.quantity * item.costPrice,
        section: item.section,
        rack: item.rack,
        bin: item.bin,
      }
    })

    purchases[index] = updated
    savePurchases(purchases)
    savePurchaseItems([...items, ...oldItems])

    appendAuditLog({
      action: 'purchase_updated',
      entityType: 'purchase',
      entityId: id,
      userId: input.userId,
      userName: input.userName,
      details: `Updated purchase ${updated.purchaseNumber}`,
    })

    return enrichPurchaseDetail(updated)
  },

  async deletePurchase(id: string, userId: string, userName: string): Promise<void> {
    await delay()
    const purchases = loadPurchases()
    const purchase = purchases.find((entry) => entry.id === id)
    if (!purchase) throw new Error('Purchase not found')
    if (purchase.purchaseStatus === 'received' || purchase.purchaseStatus === 'partially_received') {
      throw new Error('Cannot delete purchases with received stock')
    }

    savePurchases(purchases.filter((entry) => entry.id !== id))
    savePurchaseItems(loadPurchaseItems().filter((item) => item.purchaseId !== id))

    appendAuditLog({
      action: 'purchase_deleted',
      entityType: 'purchase',
      entityId: id,
      userId,
      userName,
      details: `Deleted purchase ${purchase.purchaseNumber}`,
    })
  },

  async receivePurchase(input: ReceivePurchaseInput): Promise<PurchaseDetail> {
    await delay()

    const purchases = loadPurchases()
    const index = purchases.findIndex((entry) => entry.id === input.purchaseId)
    if (index === -1) throw new Error('Purchase not found')

    const purchase = purchases[index]
    if (purchase.purchaseStatus === 'cancelled') {
      throw new Error('Cancelled purchases cannot be received')
    }

    const items = loadPurchaseItems()
    let totalReceived = 0

    for (const receiveItem of input.items) {
      if (receiveItem.quantity <= 0) continue

      const itemIndex = items.findIndex((entry) => entry.id === receiveItem.purchaseItemId)
      if (itemIndex === -1) continue

      const item = items[itemIndex]
      const remaining = item.quantity - item.receivedQuantity
      const receiveQty = Math.min(receiveItem.quantity, remaining)
      if (receiveQty <= 0) continue

      await applyInventoryReceive(item, purchase, receiveQty, input.userId, input.userName)

      items[itemIndex] = {
        ...item,
        receivedQuantity: item.receivedQuantity + receiveQty,
      }
      totalReceived += receiveQty
    }

    if (totalReceived === 0) {
      throw new Error('No valid quantities to receive')
    }

    savePurchaseItems(items)

    const purchaseItems = items.filter((entry) => entry.purchaseId === purchase.id)
    const updated: Purchase = {
      ...purchase,
      purchaseStatus: derivePurchaseStatus(purchaseItems),
      updatedAt: new Date().toISOString(),
    }
    purchases[index] = updated
    savePurchases(purchases)

    appendAuditLog({
      action: 'purchase_received',
      entityType: 'purchase',
      entityId: purchase.id,
      userId: input.userId,
      userName: input.userName,
      details: `Received stock for purchase ${purchase.purchaseNumber}`,
    })

    return enrichPurchaseDetail(updated)
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await delay()
    return loadPurchaseOrders().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    await delay()

    const suppliers = await supplierService.getSupplierOptions()
    const supplier = suppliers.find((entry) => entry.id === input.supplierId)
    if (!supplier) throw new Error('Supplier is required')

    const warehouse = loadWarehouses().find((entry) => entry.id === input.warehouseId)
    if (!warehouse) throw new Error('Warehouse is required')

    const order: PurchaseOrder = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      status: 'draft',
      notes: input.notes,
      items: input.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
      createdBy: input.userId,
      createdByName: input.userName,
      createdAt: new Date().toISOString(),
    }

    savePurchaseOrders([order, ...loadPurchaseOrders()])

    appendAuditLog({
      action: 'purchase_order_created',
      entityType: 'purchase_order',
      entityId: order.id,
      userId: input.userId,
      userName: input.userName,
      details: `Created purchase order ${order.orderNumber}`,
    })

    return order
  },

  async getDashboardSummary(): Promise<PurchaseDashboardSummary> {
    await delay()
    const purchases = loadPurchases()

    return {
      totalPurchases: purchases.length,
      purchaseValue: purchases.reduce((sum, entry) => sum + entry.totalAmount, 0),
      pendingPurchases: purchases.filter(
        (entry) => entry.purchaseStatus === 'draft' || entry.purchaseStatus === 'ordered',
      ).length,
      receivedPurchases: purchases.filter((entry) => entry.purchaseStatus === 'received').length,
      unpaidPurchases: purchases.filter(
        (entry) => entry.paymentStatus === 'unpaid' || entry.paymentStatus === 'partial',
      ).length,
    }
  },

  async getReports(): Promise<PurchaseReports> {
    await delay()
    const purchases = loadPurchases()

    const supplierMap = new Map<string, PurchaseReports['bySupplier'][number]>()
    const warehouseMap = new Map<string, PurchaseReports['byWarehouse'][number]>()
    const monthMap = new Map<string, MonthlyPurchaseReport>()

    for (const purchase of purchases) {
      const supplierEntry = supplierMap.get(purchase.supplierId) ?? {
        supplierId: purchase.supplierId,
        supplierName: purchase.supplierName,
        totalPurchases: 0,
        totalAmount: 0,
      }
      supplierEntry.totalPurchases += 1
      supplierEntry.totalAmount += purchase.totalAmount
      supplierMap.set(purchase.supplierId, supplierEntry)

      const warehouseEntry = warehouseMap.get(purchase.warehouseId) ?? {
        warehouseId: purchase.warehouseId,
        warehouseName: purchase.warehouseName,
        totalPurchases: 0,
        totalAmount: 0,
      }
      warehouseEntry.totalPurchases += 1
      warehouseEntry.totalAmount += purchase.totalAmount
      warehouseMap.set(purchase.warehouseId, warehouseEntry)

      const monthKey = purchase.purchaseDate.slice(0, 7)
      const monthEntry = monthMap.get(monthKey) ?? {
        month: monthKey,
        purchases: 0,
        value: 0,
      }
      monthEntry.purchases += 1
      monthEntry.value += purchase.totalAmount
      monthMap.set(monthKey, monthEntry)
    }

    return {
      totalPurchases: purchases.length,
      totalPurchaseValue: purchases.reduce((sum, entry) => sum + entry.totalAmount, 0),
      bySupplier: [...supplierMap.values()],
      byWarehouse: [...warehouseMap.values()],
      monthly: [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month)),
    }
  },

  async getSupplierPurchaseHistory(): Promise<SupplierPurchaseHistoryItem[]> {
    await delay()
    const purchases = loadPurchases()
    const map = new Map<string, SupplierPurchaseHistoryItem>()

    for (const purchase of purchases) {
      const entry = map.get(purchase.supplierId) ?? {
        supplierId: purchase.supplierId,
        supplierName: purchase.supplierName,
        totalPurchases: 0,
        totalAmount: 0,
        lastPurchaseDate: null,
      }
      entry.totalPurchases += 1
      entry.totalAmount += purchase.totalAmount
      if (!entry.lastPurchaseDate || purchase.purchaseDate > entry.lastPurchaseDate) {
        entry.lastPurchaseDate = purchase.purchaseDate
      }
      map.set(purchase.supplierId, entry)
    }

    return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount)
  },

  async getWarehousePurchaseSummary(): Promise<WarehousePurchaseSummaryItem[]> {
    await delay()
    const purchases = loadPurchases()
    const items = loadPurchaseItems()
    const warehouses = loadWarehouses()

    return warehouses.map((warehouse) => {
      const warehousePurchases = purchases.filter((entry) => entry.warehouseId === warehouse.id)
      const purchaseIds = new Set(warehousePurchases.map((entry) => entry.id))
      const warehouseItems = items.filter((item) => purchaseIds.has(item.purchaseId))
      const productsReceived = warehouseItems.reduce((sum, item) => sum + item.receivedQuantity, 0)
      const inventoryValue = warehouseItems.reduce(
        (sum, item) => sum + item.receivedQuantity * item.costPrice,
        0,
      )

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.warehouseName,
        productsReceived,
        inventoryValue,
      }
    })
  },

  async getReceivablePurchases(): Promise<PurchaseDetail[]> {
    await delay()
    return loadPurchases()
      .filter(
        (entry) =>
          entry.purchaseStatus === 'ordered' ||
          entry.purchaseStatus === 'partially_received',
      )
      .map(enrichPurchaseDetail)
  },
}

type MonthlyPurchaseReport = PurchaseReports['monthly'][number]
