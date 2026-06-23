import type {
  CreateLocationInput,
  CreateTransferInput,
  CreateWarehouseInput,
  CreateWarehouseStockInput,
  InventoryLocationFilters,
  InventoryLocationListResult,
  LocationListFilters,
  LocationListResult,
  ProductLocatorResult,
  ProductAvailabilitySearchResult,
  TransferListFilters,
  TransferListResult,
  UpdateLocationInput,
  UpdateWarehouseInput,
  Warehouse,
  WarehouseDashboardSummary,
  WarehouseDetail,
  WarehouseInventoryReportRow,
  WarehouseListFilters,
  WarehouseListItem,
  WarehouseListResult,
  WarehouseLocation,
  WarehouseStockRecord,
  WarehouseTransfer,
} from '@/features/warehouses/types'
import { LOW_STOCK_THRESHOLD } from '@/features/warehouses/constants'
import type { Product, ProductVariant } from '@/features/products/types'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'
import {
  SEED_TRANSFER_NUMBER_COUNTER,
  SEED_WAREHOUSE_CODE_COUNTER,
  SEED_WAREHOUSE_LOCATIONS,
  SEED_WAREHOUSE_STOCK,
  SEED_WAREHOUSE_TRANSFERS,
  SEED_WAREHOUSES,
  TRANSFER_NUMBER_COUNTER_KEY,
  WAREHOUSE_CODE_COUNTER_KEY,
  WAREHOUSE_LOCATIONS_STORAGE_KEY,
  WAREHOUSE_STOCK_STORAGE_KEY,
  WAREHOUSE_TRANSFERS_STORAGE_KEY,
  WAREHOUSES_STORAGE_KEY,
} from '@/services/warehouses/mock-data'

function loadWarehouses(): Warehouse[] {
  return readStorage(WAREHOUSES_STORAGE_KEY, SEED_WAREHOUSES)
}

function saveWarehouses(warehouses: Warehouse[]): void {
  writeStorage(WAREHOUSES_STORAGE_KEY, warehouses)
}

function loadLocations(): WarehouseLocation[] {
  return readStorage(WAREHOUSE_LOCATIONS_STORAGE_KEY, SEED_WAREHOUSE_LOCATIONS)
}

function saveLocations(locations: WarehouseLocation[]): void {
  writeStorage(WAREHOUSE_LOCATIONS_STORAGE_KEY, locations)
}

function loadStock(): WarehouseStockRecord[] {
  return readStorage(WAREHOUSE_STOCK_STORAGE_KEY, SEED_WAREHOUSE_STOCK).map(enrichStockRecord)
}

function loadProducts(): Product[] {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants(): ProductVariant[] {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function saveVariants(variants: ProductVariant[]): void {
  writeStorage(MOCK_STORAGE_KEYS.VARIANTS, variants)
}

function enrichStockRecord(entry: WarehouseStockRecord): WarehouseStockRecord {
  if (entry.brand && entry.color) {
    return entry
  }

  const product = loadProducts().find((item) => item.id === entry.productId)
  const brand = entry.brand || product?.brand || ''
  const color = entry.color || entry.variantName || ''

  return { ...entry, brand, color }
}

function saveStock(stock: WarehouseStockRecord[]): void {
  writeStorage(WAREHOUSE_STOCK_STORAGE_KEY, stock)
}

function loadTransfers(): WarehouseTransfer[] {
  return readStorage(WAREHOUSE_TRANSFERS_STORAGE_KEY, SEED_WAREHOUSE_TRANSFERS)
}

function saveTransfers(transfers: WarehouseTransfer[]): void {
  writeStorage(WAREHOUSE_TRANSFERS_STORAGE_KEY, transfers)
}

function loadWarehouseCodeCounter(): number {
  return readStorage(WAREHOUSE_CODE_COUNTER_KEY, SEED_WAREHOUSE_CODE_COUNTER)
}

function saveWarehouseCodeCounter(value: number): void {
  writeStorage(WAREHOUSE_CODE_COUNTER_KEY, value)
}

function loadTransferCounter(): number {
  return readStorage(TRANSFER_NUMBER_COUNTER_KEY, SEED_TRANSFER_NUMBER_COUNTER)
}

function saveTransferCounter(value: number): void {
  writeStorage(TRANSFER_NUMBER_COUNTER_KEY, value)
}

function generateWarehouseCode(): string {
  const next = loadWarehouseCodeCounter() + 1
  saveWarehouseCodeCounter(next)
  return `WH-${String(next).padStart(3, '0')}`
}

function generateTransferNumber(): string {
  const next = loadTransferCounter() + 1
  saveTransferCounter(next)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `TRF-${date}-${String(next).padStart(3, '0')}`
}

function getWarehouseStock(warehouseId?: string): WarehouseStockRecord[] {
  const stock = loadStock()
  return warehouseId ? stock.filter((entry) => entry.warehouseId === warehouseId) : stock
}

function summarizeWarehouse(warehouseId: string) {
  const stock = getWarehouseStock(warehouseId)
  const variantIds = new Set(stock.map((entry) => entry.productVariantId))
  const totalStockQuantity = stock.reduce((sum, entry) => sum + entry.quantity, 0)
  const inventoryValue = stock.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0)

  return {
    totalProducts: variantIds.size,
    totalStockQuantity,
    inventoryValue,
  }
}

function enrichListItem(warehouse: Warehouse): WarehouseListItem {
  const summary = summarizeWarehouse(warehouse.id)

  return {
    id: warehouse.id,
    warehouseCode: warehouse.warehouseCode,
    warehouseName: warehouse.warehouseName,
    description: warehouse.description,
    totalProducts: summary.totalProducts,
    totalStockQuantity: summary.totalStockQuantity,
    status: warehouse.status,
  }
}

function filterWarehouses(warehouses: Warehouse[], filters: WarehouseListFilters): Warehouse[] {
  const search = filters.search?.trim().toLowerCase()

  return warehouses.filter((warehouse) => {
    if (search) {
      const haystack = [
        warehouse.warehouseName,
        warehouse.warehouseCode,
        warehouse.description,
        warehouse.manager,
        warehouse.address,
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    if (filters.status === 'active' && warehouse.status !== 'active') return false
    if (filters.status === 'inactive' && warehouse.status !== 'inactive') return false

    return true
  })
}

function filterLocations(
  locations: WarehouseLocation[],
  filters: LocationListFilters,
): WarehouseLocation[] {
  const search = filters.search?.trim().toLowerCase()

  return locations.filter((location) => {
    if (filters.warehouseId && filters.warehouseId !== 'all' && location.warehouseId !== filters.warehouseId) {
      return false
    }

    if (search) {
      const haystack = [
        location.warehouseName,
        location.section,
        location.rack,
        location.bin,
        location.description,
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    return true
  })
}

function filterInventoryLocations(
  stock: WarehouseStockRecord[],
  filters: InventoryLocationFilters,
): WarehouseStockRecord[] {
  const search = filters.search?.trim().toLowerCase()

  return stock.filter((entry) => {
    if (filters.warehouseId && filters.warehouseId !== 'all' && entry.warehouseId !== filters.warehouseId) {
      return false
    }

    if (filters.categoryId && filters.categoryId !== 'all' && entry.categoryId !== filters.categoryId) {
      return false
    }

    if (filters.stockStatus === 'low' && entry.quantity > LOW_STOCK_THRESHOLD) return false
    if (filters.stockStatus === 'in_stock' && entry.quantity <= 0) return false

    if (search) {
      const haystack = [
        entry.productName,
        entry.variantName,
        entry.brand,
        entry.color,
        entry.warehouseName,
        entry.section,
        entry.rack,
        entry.bin,
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    return true
  })
}

function resolveProduct(productId: string, productVariantId: string) {
  const product = loadProducts().find((entry) => entry.id === productId)
  const variant = loadVariants().find((entry) => entry.id === productVariantId)

  if (!product || !variant || variant.productId !== productId) {
    throw new Error('Invalid product or variant selected.')
  }

  return { product, variant }
}

function resolveStockEntry(input: Pick<CreateWarehouseStockInput, 'productName' | 'brand' | 'color'>) {
  const productName = input.productName.trim()
  const brand = input.brand.trim()
  const colorInput = input.color.trim()
  const products = loadProducts()

  let product =
    products.find(
      (entry) =>
        entry.name.toLowerCase() === productName.toLowerCase() &&
        entry.brand.toLowerCase() === brand.toLowerCase(),
    ) ??
    products.find((entry) => entry.name.toLowerCase() === productName.toLowerCase())

  if (!product) {
    throw new Error(
      `No product found for "${productName}" (${brand}). Add the product in Products first.`,
    )
  }

  const allVariants = loadVariants()
  const productVariants = allVariants.filter((entry) => entry.productId === product!.id)
  let variant = colorInput
    ? productVariants.find((entry) => entry.name.toLowerCase() === colorInput.toLowerCase())
    : productVariants.find((entry) => entry.isActive) ?? productVariants[0]

  if (!variant) {
    const now = new Date().toISOString()
    const variantName = colorInput || 'Standard'
    variant = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: variantName,
      variantType: colorInput ? 'Color' : 'Default',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    allVariants.push(variant)
    saveVariants(allVariants)
  }

  return { product, variant, brand: product.brand, color: variant.name }
}

function getGeneralLocation(warehouseId: string): WarehouseLocation {
  const existing = loadLocations().find(
    (location) => location.warehouseId === warehouseId && location.section === 'General',
  )

  if (existing) {
    return existing
  }

  const warehouse = loadWarehouses().find((entry) => entry.id === warehouseId)
  if (!warehouse) {
    throw new Error('Warehouse not found.')
  }

  const location: WarehouseLocation = {
    id: crypto.randomUUID(),
    warehouseId,
    warehouseName: warehouse.warehouseName,
    section: 'General',
    rack: '-',
    bin: '-',
    description: 'Default warehouse tracking — no specific shelf assigned',
  }

  const locations = loadLocations()
  locations.push(location)
  saveLocations(locations)

  return location
}

function tokenizeSearchQuery(search: string): string[] {
  return search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function matchesSearchTokens(haystack: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false
  const normalized = haystack.toLowerCase()
  return tokens.every((token) => normalized.includes(token))
}

function buildStockSearchLabel(entry: WarehouseStockRecord): string {
  return `${entry.productName} ${entry.brand} ${entry.color} ${entry.variantName}`
}

function findCatalogMatches(search: string) {
  const tokens = tokenizeSearchQuery(search)
  if (tokens.length === 0) return []

  const matches: NonNullable<ProductAvailabilitySearchResult['catalogMatches']> = []

  for (const product of loadProducts()) {
    for (const variant of loadVariants().filter((entry) => entry.productId === product.id)) {
      const haystack = `${product.name} ${product.brand} ${variant.name}`
      if (matchesSearchTokens(haystack, tokens)) {
        matches.push({
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          color: variant.name,
          productVariantId: variant.id,
        })
      }
    }
  }

  return matches
}

function groupStockIntoLocatorResults(stock: WarehouseStockRecord[]): ProductLocatorResult[] {
  const grouped = new Map<string, ProductLocatorResult>()

  for (const entry of stock) {
    if (entry.quantity <= 0) continue

    const key = entry.productVariantId
    const current = grouped.get(key) ?? {
      productId: entry.productId,
      productName: entry.productName,
      brand: entry.brand,
      color: entry.color,
      variantName: entry.variantName,
      productVariantId: entry.productVariantId,
      locations: [],
      totalQuantity: 0,
    }

    const existingLocation = current.locations.find(
      (location) => location.warehouseId === entry.warehouseId,
    )

    if (existingLocation) {
      existingLocation.quantity += entry.quantity
    } else {
      current.locations.push({
        warehouseId: entry.warehouseId,
        warehouseName: entry.warehouseName,
        quantity: entry.quantity,
      })
    }

    current.totalQuantity += entry.quantity
    grouped.set(key, current)
  }

  return [...grouped.values()].sort((a, b) => a.productName.localeCompare(b.productName))
}

function getReceivingLocation(warehouseId: string): WarehouseLocation {
  const existing = loadLocations().find(
    (location) => location.warehouseId === warehouseId && location.section === 'Receiving',
  )

  if (existing) {
    return existing
  }

  const warehouse = loadWarehouses().find((entry) => entry.id === warehouseId)
  if (!warehouse) {
    throw new Error('Warehouse not found.')
  }

  const location: WarehouseLocation = {
    id: crypto.randomUUID(),
    warehouseId,
    warehouseName: warehouse.warehouseName,
    section: 'Receiving',
    rack: 'A-01',
    bin: 'B-01',
    description: 'Auto-created receiving location',
  }

  const locations = loadLocations()
  locations.push(location)
  saveLocations(locations)

  return location
}

export const warehouseService = {
  async getDashboardSummary(): Promise<WarehouseDashboardSummary> {
    await delay(150)

    const stock = loadStock()
    const transfers = loadTransfers()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return {
      totalWarehouses: loadWarehouses().filter((entry) => entry.status === 'active').length,
      totalInventoryQuantity: stock.reduce((sum, entry) => sum + entry.quantity, 0),
      totalInventoryValue: stock.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0),
      lowStockItems: stock.filter((entry) => entry.quantity > 0 && entry.quantity <= LOW_STOCK_THRESHOLD).length,
      transfersThisMonth: transfers.filter(
        (entry) => new Date(entry.createdAt) >= monthStart,
      ).length,
    }
  },

  async getInventoryReport(): Promise<WarehouseInventoryReportRow[]> {
    await delay(100)

    return loadWarehouses().map((warehouse) => {
      const summary = summarizeWarehouse(warehouse.id)
      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.warehouseName,
        totalProducts: summary.totalProducts,
        totalQuantity: summary.totalStockQuantity,
        inventoryValue: summary.inventoryValue,
      }
    })
  },

  async getWarehouses(filters: WarehouseListFilters = {}): Promise<WarehouseListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterWarehouses(loadWarehouses(), filters).sort((a, b) =>
      a.warehouseName.localeCompare(b.warehouseName),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit).map(enrichListItem),
      meta: { page, limit, total, totalPages },
    }
  },

  async getWarehouseById(id: string): Promise<WarehouseDetail> {
    await delay()

    const warehouse = loadWarehouses().find((entry) => entry.id === id)
    if (!warehouse) {
      throw new Error('Warehouse not found.')
    }

    const summary = summarizeWarehouse(id)

    return {
      ...warehouse,
      totalProducts: summary.totalProducts,
      totalStockQuantity: summary.totalStockQuantity,
      inventoryValue: summary.inventoryValue,
    }
  },

  async createWarehouse(input: CreateWarehouseInput): Promise<WarehouseDetail> {
    await delay()

    const timestamp = new Date().toISOString()
    const warehouse: Warehouse = {
      id: crypto.randomUUID(),
      warehouseCode: generateWarehouseCode(),
      warehouseName: input.warehouseName.trim(),
      description: input.description.trim(),
      address: input.address.trim(),
      manager: input.manager.trim(),
      status: input.status,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const warehouses = loadWarehouses()
    warehouses.push(warehouse)
    saveWarehouses(warehouses)

    getReceivingLocation(warehouse.id)

    return warehouseService.getWarehouseById(warehouse.id)
  },

  async updateWarehouse(id: string, input: UpdateWarehouseInput): Promise<WarehouseDetail> {
    await delay()

    const warehouses = loadWarehouses()
    const index = warehouses.findIndex((entry) => entry.id === id)

    if (index === -1) {
      throw new Error('Warehouse not found.')
    }

    const updated: Warehouse = {
      ...warehouses[index],
      warehouseName: input.warehouseName.trim(),
      description: input.description.trim(),
      address: input.address.trim(),
      manager: input.manager.trim(),
      status: input.status,
      updatedAt: new Date().toISOString(),
    }

    warehouses[index] = updated
    saveWarehouses(warehouses)

    const locations = loadLocations()
    let locationsChanged = false
    for (let i = 0; i < locations.length; i += 1) {
      if (locations[i].warehouseId === id) {
        locations[i] = { ...locations[i], warehouseName: updated.warehouseName }
        locationsChanged = true
      }
    }
    if (locationsChanged) saveLocations(locations)

    const stock = loadStock()
    let stockChanged = false
    for (let i = 0; i < stock.length; i += 1) {
      if (stock[i].warehouseId === id) {
        stock[i] = { ...stock[i], warehouseName: updated.warehouseName }
        stockChanged = true
      }
    }
    if (stockChanged) saveStock(stock)

    return warehouseService.getWarehouseById(id)
  },

  async deleteWarehouse(id: string): Promise<void> {
    await delay()

    if (getWarehouseStock(id).length > 0) {
      throw new Error('Cannot delete a warehouse that still holds stock.')
    }

    saveWarehouses(loadWarehouses().filter((entry) => entry.id !== id))
    saveLocations(loadLocations().filter((entry) => entry.warehouseId !== id))
  },

  async getLocations(filters: LocationListFilters = {}): Promise<LocationListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterLocations(loadLocations(), filters).sort((a, b) =>
      a.warehouseName.localeCompare(b.warehouseName),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async createLocation(input: CreateLocationInput): Promise<WarehouseLocation> {
    await delay()

    const warehouse = loadWarehouses().find((entry) => entry.id === input.warehouseId)
    if (!warehouse) {
      throw new Error('Invalid warehouse selected.')
    }

    const location: WarehouseLocation = {
      id: crypto.randomUUID(),
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      section: input.section.trim(),
      rack: input.rack.trim(),
      bin: input.bin.trim(),
      description: input.description.trim(),
    }

    const locations = loadLocations()
    locations.push(location)
    saveLocations(locations)

    return location
  },

  async updateLocation(id: string, input: UpdateLocationInput): Promise<WarehouseLocation> {
    await delay()

    const locations = loadLocations()
    const index = locations.findIndex((entry) => entry.id === id)

    if (index === -1) {
      throw new Error('Location not found.')
    }

    const warehouse = loadWarehouses().find((entry) => entry.id === input.warehouseId)
    if (!warehouse) {
      throw new Error('Invalid warehouse selected.')
    }

    const updated: WarehouseLocation = {
      ...locations[index],
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      section: input.section.trim(),
      rack: input.rack.trim(),
      bin: input.bin.trim(),
      description: input.description.trim(),
    }

    locations[index] = updated
    saveLocations(locations)

    const stock = loadStock()
    let stockChanged = false
    for (let i = 0; i < stock.length; i += 1) {
      if (stock[i].locationId === id) {
        stock[i] = {
          ...stock[i],
          warehouseId: updated.warehouseId,
          warehouseName: updated.warehouseName,
          section: updated.section,
          rack: updated.rack,
          bin: updated.bin,
        }
        stockChanged = true
      }
    }
    if (stockChanged) saveStock(stock)

    return updated
  },

  async deleteLocation(id: string): Promise<void> {
    await delay()

    if (loadStock().some((entry) => entry.locationId === id && entry.quantity > 0)) {
      throw new Error('Cannot delete a location that still contains stock.')
    }

    saveLocations(loadLocations().filter((entry) => entry.id !== id))
    saveStock(loadStock().filter((entry) => entry.locationId !== id))
  },

  async getInventoryLocations(
    filters: InventoryLocationFilters = {},
  ): Promise<InventoryLocationListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterInventoryLocations(loadStock(), filters).sort((a, b) =>
      a.productName.localeCompare(b.productName),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async locateProduct(search: string): Promise<ProductLocatorResult[]> {
    const availability = await warehouseService.searchProductAvailability(search)
    return availability.results
  },

  async searchProductAvailability(search: string): Promise<ProductAvailabilitySearchResult> {
    await delay(150)

    const query = search.trim()
    const tokens = tokenizeSearchQuery(query)

    if (!query || tokens.length === 0) {
      return {
        status: 'not_found',
        message: 'Enter a product name, brand, or color to search.',
        query,
        results: [],
      }
    }

    const matchingStock = loadStock().filter(
      (entry) => entry.quantity > 0 && matchesSearchTokens(buildStockSearchLabel(entry), tokens),
    )
    const results = groupStockIntoLocatorResults(matchingStock)

    if (results.length > 0) {
      return {
        status: 'available',
        message: `${results.length} matching product${results.length === 1 ? '' : 's'} in stock.`,
        query,
        results,
      }
    }

    const catalogMatches = findCatalogMatches(query)

    if (catalogMatches.length > 0) {
      const label = catalogMatches
        .slice(0, 2)
        .map((match) => `${match.productName} (${match.brand}, ${match.color})`)
        .join('; ')

      return {
        status: 'out_of_stock',
        message: `Product not available — "${label}" is registered but has no stock in any warehouse.`,
        query,
        results: [],
        catalogMatches,
      }
    }

    return {
      status: 'not_found',
      message: `Product not available — no match found for "${query}". Check the name, brand, and color.`,
      query,
      results: [],
    }
  },

  async getTransfers(filters: TransferListFilters = {}): Promise<TransferListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = loadTransfers().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async createTransfer(input: CreateTransferInput): Promise<WarehouseTransfer> {
    await delay()

    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new Error('Source and destination warehouses must be different.')
    }

    const fromWarehouse = loadWarehouses().find((entry) => entry.id === input.fromWarehouseId)
    const toWarehouse = loadWarehouses().find((entry) => entry.id === input.toWarehouseId)

    if (!fromWarehouse || !toWarehouse) {
      throw new Error('Invalid warehouse selected.')
    }

    const { product, variant } = resolveProduct(input.productId, input.productVariantId)
    const stock = loadStock()
    const sourceRecords = stock
      .filter(
        (entry) =>
          entry.warehouseId === input.fromWarehouseId &&
          entry.productVariantId === input.productVariantId &&
          entry.quantity > 0,
      )
      .sort((a, b) => b.quantity - a.quantity)

    const available = sourceRecords.reduce((sum, entry) => sum + entry.quantity, 0)
    if (available < input.quantity) {
      throw new Error(`Insufficient stock in ${fromWarehouse.warehouseName}. Available: ${available}`)
    }

    let remaining = input.quantity
    for (const record of sourceRecords) {
      if (remaining <= 0) break
      const deduction = Math.min(record.quantity, remaining)
      record.quantity -= deduction
      remaining -= deduction
    }

    const receivingLocation = getReceivingLocation(input.toWarehouseId)
    const destination = stock.find(
      (entry) =>
        entry.warehouseId === input.toWarehouseId &&
        entry.locationId === receivingLocation.id &&
        entry.productVariantId === input.productVariantId,
    )

    if (destination) {
      destination.quantity += input.quantity
    } else {
      stock.push({
        id: crypto.randomUUID(),
        warehouseId: toWarehouse.id,
        warehouseName: toWarehouse.warehouseName,
        locationId: receivingLocation.id,
        section: receivingLocation.section,
        rack: receivingLocation.rack,
        bin: receivingLocation.bin,
        productId: product.id,
        productName: product.name,
        productVariantId: variant.id,
        variantName: variant.name,
        brand: product.brand,
        color: variant.name,
        categoryId: product.categoryId,
        quantity: input.quantity,
        unitCost: variant.costPrice,
      })
    }

    saveStock(stock.filter((entry) => entry.quantity > 0))

    const transfer: WarehouseTransfer = {
      id: crypto.randomUUID(),
      transferNumber: generateTransferNumber(),
      productId: product.id,
      productName: product.name,
      productVariantId: variant.id,
      variantName: variant.name,
      fromWarehouseId: fromWarehouse.id,
      fromWarehouseName: fromWarehouse.warehouseName,
      toWarehouseId: toWarehouse.id,
      toWarehouseName: toWarehouse.warehouseName,
      quantity: input.quantity,
      reason: input.reason.trim(),
      notes: input.notes.trim(),
      userId: input.userId,
      userName: input.userName,
      createdAt: new Date().toISOString(),
    }

    const transfers = loadTransfers()
    transfers.unshift(transfer)
    saveTransfers(transfers)

    return transfer
  },

  async addWarehouseStock(input: CreateWarehouseStockInput): Promise<WarehouseStockRecord> {
    await delay()

    const warehouse = loadWarehouses().find((entry) => entry.id === input.warehouseId)
    if (!warehouse) {
      throw new Error('Invalid warehouse selected.')
    }

    if (warehouse.status !== 'active') {
      throw new Error('Stock can only be added to active warehouses.')
    }

    const location = input.locationId
      ? loadLocations().find(
          (entry) => entry.id === input.locationId && entry.warehouseId === input.warehouseId,
        )
      : getGeneralLocation(input.warehouseId)

    if (!location) {
      throw new Error('Invalid storage location selected for this warehouse.')
    }

    const { product, variant, brand, color } = resolveStockEntry(input)
    const stock = loadStock()
    const existing = stock.find(
      (entry) =>
        entry.warehouseId === input.warehouseId && entry.productVariantId === variant.id,
    )

    let record: WarehouseStockRecord

    if (existing) {
      existing.quantity += input.quantity
      existing.brand = brand
      existing.color = color
      existing.productName = product.name
      existing.variantName = variant.name
      existing.unitCost = variant.costPrice || existing.unitCost
      record = existing
    } else {
      record = {
        id: crypto.randomUUID(),
        warehouseId: warehouse.id,
        warehouseName: warehouse.warehouseName,
        locationId: location.id,
        section: location.section,
        rack: location.rack,
        bin: location.bin,
        productId: product.id,
        productName: product.name,
        productVariantId: variant.id,
        variantName: variant.name,
        brand,
        color,
        categoryId: product.categoryId,
        quantity: input.quantity,
        unitCost: variant.costPrice,
      }
      stock.push(record)
    }

    saveStock(stock)

    const variants = loadVariants()
    const variantIndex = variants.findIndex((entry) => entry.id === variant.id)
    if (variantIndex >= 0) {
      variants[variantIndex] = {
        ...variants[variantIndex],
        currentStock: variants[variantIndex].currentStock + input.quantity,
        updatedAt: new Date().toISOString(),
      }
      saveVariants(variants)
    }

    return record
  },
}
