import type {
  Branch,
  InventoryAdjustmentInput,
  InventoryDashboardSummary,
  InventoryHistoryFilters,
  InventoryHistoryResult,
  InventoryListFilters,
  InventoryListItem,
  InventoryListResult,
  InventoryStatus,
  InventoryTransaction,
  ProductOption,
  SaleStockDeductionInput,
  StockInInput,
  StockOutInput,
  TransactionType,
  VariantOption,
} from '@/features/inventory/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import { mapProductListItem, mapProductVariant } from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function mapBranch(dto: Record<string, unknown>): Branch {
  const status = dto.status
  const isActive =
    status === 1 ||
    status === 'Active' ||
    status === 'active' ||
    dto.isActive === true ||
    status === undefined

  return {
    id: String(dto.id),
    name: String(dto.branchName ?? dto.name ?? ''),
    code: String(dto.branchCode ?? dto.code ?? ''),
    isActive,
  }
}

function mapInventoryStatus(value: unknown): InventoryStatus {
  const normalized = String(value ?? 'in_stock').toLowerCase()
  if (normalized === 'out_of_stock') return 'out_of_stock'
  if (normalized === 'low_stock') return 'low_stock'
  return 'in_stock'
}

function mapInventoryListItem(dto: Record<string, unknown>): InventoryListItem {
  return {
    id: String(dto.id),
    branchId: String(dto.warehouseId ?? dto.branchId ?? ''),
    productVariantId: String(dto.productVariantId),
    quantity: Number(dto.quantity ?? 0),
    minimumStockLevel: Number(dto.minimumStockLevel ?? 0),
    lastUpdated: String(dto.lastUpdated ?? new Date().toISOString()),
    productId: String(dto.productId ?? ''),
    productName: String(dto.productName ?? ''),
    variantName: String(dto.variantName ?? ''),
    variantType: String(dto.variantValue ?? dto.variantType ?? ''),
    categoryId: String(dto.categoryId ?? ''),
    categoryName: String(dto.categoryName ?? ''),
    brand: String(dto.brand ?? ''),
    sku: String(dto.productCode ?? dto.sku ?? ''),
    branchName: String(dto.warehouseName ?? dto.branchName ?? ''),
    unitCost: Number(dto.unitCost ?? 0),
    status: mapInventoryStatus(dto.status),
    stockValue: Number(dto.stockValue ?? 0),
  }
}

function mapTransactionType(value: unknown): TransactionType {
  if (value === 1 || value === 'StockIn' || value === 'stock_in') return 'stock_in'
  if (value === 2 || value === 'StockOut' || value === 'stock_out') return 'stock_out'
  if (value === 3 || value === 'Adjustment' || value === 'adjustment') return 'adjustment'
  if (value === 4 || value === 'PurchaseReceive' || value === 'purchase') return 'purchase'
  if (value === 5 || value === 'Sale' || value === 'sale') return 'sale'
  if (value === 6 || value === 'Transfer' || value === 'transfer') return 'transfer'
  return 'adjustment'
}

function mapInventoryTransaction(dto: Record<string, unknown>): InventoryTransaction {
  return {
    id: String(dto.id),
    inventoryId: String(dto.inventoryId ?? dto.id ?? ''),
    branchId: String(dto.warehouseId ?? dto.branchId ?? ''),
    productId: String(dto.productId ?? ''),
    productVariantId: String(dto.productVariantId),
    productName: String(dto.productName ?? ''),
    variantName: String(dto.variantName ?? ''),
    branchName: String(dto.warehouseName ?? dto.branchName ?? ''),
    transactionType: mapTransactionType(dto.transactionType),
    quantity: Number(dto.quantity ?? 0),
    previousQuantity: Number(dto.quantityBefore ?? dto.previousQuantity ?? 0),
    newQuantity: Number(dto.quantityAfter ?? dto.newQuantity ?? 0),
    unitCost: dto.unitCost !== undefined ? Number(dto.unitCost) : undefined,
    supplier: dto.supplier ? String(dto.supplier) : undefined,
    reason: dto.reason ? String(dto.reason) : undefined,
    notes: dto.notes ? String(dto.notes) : undefined,
    userId: String(dto.userId ?? ''),
    userName: String(dto.userName ?? ''),
    referenceNumber: String(dto.referenceNumber ?? ''),
    createdAt: String(dto.createdAt ?? new Date().toISOString()),
  }
}

function buildInventoryQueryParams(filters: InventoryListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.categoryId) {
    params.categoryId = filters.categoryId
  }

  if (filters.branchId) {
    params.warehouseId = filters.branchId
  }

  if (filters.status && filters.status !== 'all') {
    params.status = filters.status
  }

  return params
}

function buildHistoryQueryParams(filters: InventoryHistoryFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.branchId) {
    params.warehouseId = filters.branchId
  }

  if (filters.productId) {
    params.productVariantId = filters.productId
  }

  if (filters.transactionType && filters.transactionType !== 'all') {
    const typeMap: Record<TransactionType, number> = {
      stock_in: 1,
      stock_out: 2,
      adjustment: 3,
      purchase: 4,
      sale: 5,
      transfer: 6,
    }
    params.transactionType = typeMap[filters.transactionType]
  }

  if (filters.dateFrom) {
    params.dateFrom = filters.dateFrom
  }

  if (filters.dateTo) {
    params.dateTo = filters.dateTo
  }

  return params
}

export const inventoryService = {
  async getBranches(): Promise<Branch[]> {
    const result = await apiGet<Record<string, unknown>[]>(API_ENDPOINTS.branches)
    return result.map((item) => mapBranch(item)).filter((branch) => branch.isActive)
  },

  async getProductOptions(): Promise<ProductOption[]> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.products, {
      params: { page: 1, pageSize: 500, isActive: true },
    })

    return result.items
      .map((item) => {
        const product = mapProductListItem(item)
        return { id: product.id, name: product.name, sku: product.sku }
      })
      .sort((left, right) => left.name.localeCompare(right.name))
  },

  async getVariantOptions(productId: string, branchId?: string): Promise<VariantOption[]> {
    const variants = await apiGet<Record<string, unknown>[]>(
      API_ENDPOINTS.productVariants(productId),
    )

    const inventory = branchId
      ? await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.inventory, {
          params: { warehouseId: branchId, page: 1, pageSize: 500 },
        })
      : null

    return variants
      .filter((item) => item.isActive !== false)
      .map((item) => {
        const variant = mapProductVariant(item)
        const record = inventory?.items.find(
          (entry) => String(entry.productVariantId) === variant.id,
        )

        return {
          id: variant.id,
          productId: variant.productId,
          name: variant.name,
          currentQuantity: Number(record?.quantity ?? variant.currentStock ?? 0),
          minimumStock: Number(record?.minimumStockLevel ?? variant.minimumStock ?? 0),
          unitCost: variant.costPrice,
        }
      })
  },

  async getInventorySummary(): Promise<InventoryDashboardSummary> {
    const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.inventorySummary)
    return {
      totalProducts: Number(result.totalProducts ?? 0),
      totalStockQuantity: Number(result.totalStockQuantity ?? 0),
      inventoryValue: Number(result.inventoryValue ?? 0),
      lowStockProducts: Number(result.lowStockProducts ?? 0),
      outOfStockProducts: Number(result.outOfStockProducts ?? 0),
    }
  },

  async getInventory(filters: InventoryListFilters = {}): Promise<InventoryListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.inventory, {
      params: buildInventoryQueryParams(filters),
    })

    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapInventoryListItem(item)),
      meta: paged.meta,
    }
  },

  async getInventoryById(id: string): Promise<InventoryListItem | null> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.inventory, {
      params: { page: 1, pageSize: 1, search: id },
    })

    const match = result.items.find((item) => String(item.id) === id)
    return match ? mapInventoryListItem(match) : null
  },

  async getLowStockProducts(filters: InventoryListFilters = {}): Promise<InventoryListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(
      API_ENDPOINTS.inventoryLowStock,
      { params: buildInventoryQueryParams({ ...filters, status: 'all' }) },
    )

    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapInventoryListItem(item)),
      meta: paged.meta,
    }
  },

  async getInventoryHistory(filters: InventoryHistoryFilters = {}): Promise<InventoryHistoryResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(
      API_ENDPOINTS.inventoryHistory,
      { params: buildHistoryQueryParams(filters) },
    )

    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapInventoryTransaction(item)),
      meta: paged.meta,
    }
  },

  async stockIn(input: StockInInput): Promise<InventoryTransaction> {
    const result = await apiPost<Record<string, unknown>>(API_ENDPOINTS.inventoryStockIn, {
      productVariantId: input.productVariantId,
      warehouseId: input.branchId,
      quantity: input.quantity,
      unitCost: input.unitCost,
      supplier: input.supplier,
      notes: input.notes,
    })
    return mapInventoryTransaction(result)
  },

  async stockOut(input: StockOutInput): Promise<InventoryTransaction> {
    const result = await apiPost<Record<string, unknown>>(API_ENDPOINTS.inventoryStockOut, {
      productVariantId: input.productVariantId,
      warehouseId: input.branchId,
      quantity: input.quantity,
      reason: input.reason,
      notes: input.notes,
    })
    return mapInventoryTransaction(result)
  },

  async adjustInventory(input: InventoryAdjustmentInput): Promise<InventoryTransaction> {
    const result = await apiPut<Record<string, unknown>>(API_ENDPOINTS.inventoryAdjustment, {
      productVariantId: input.productVariantId,
      warehouseId: input.branchId,
      newQuantity: input.newQuantity,
      reason: input.reason,
    })
    return mapInventoryTransaction(result)
  },

  async deductForSale(input: SaleStockDeductionInput): Promise<InventoryTransaction> {
    return this.stockOut({
      productId: '',
      productVariantId: input.productVariantId,
      branchId: input.branchId,
      quantity: input.quantity,
      reason: 'Sale',
      notes: `Receipt: ${input.receiptNumber}`,
      userId: input.userId,
      userName: input.userName,
    })
  },
}
