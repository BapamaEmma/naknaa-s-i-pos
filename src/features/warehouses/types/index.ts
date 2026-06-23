export type WarehouseStatus = 'active' | 'inactive'

export interface Warehouse {
  id: string
  warehouseCode: string
  warehouseName: string
  description: string
  address: string
  manager: string
  status: WarehouseStatus
  createdAt: string
  updatedAt: string
}

export interface WarehouseListItem {
  id: string
  warehouseCode: string
  warehouseName: string
  description: string
  totalProducts: number
  totalStockQuantity: number
  status: WarehouseStatus
}

export interface WarehouseDetail extends Warehouse {
  totalProducts: number
  totalStockQuantity: number
  inventoryValue: number
}

export interface WarehouseListFilters {
  search?: string
  status?: 'all' | WarehouseStatus
  page?: number
  limit?: number
}

export interface WarehouseListResult {
  data: WarehouseListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateWarehouseInput {
  warehouseName: string
  description: string
  address: string
  manager: string
  status: WarehouseStatus
}

export interface UpdateWarehouseInput extends CreateWarehouseInput {}

export interface WarehouseDashboardSummary {
  totalWarehouses: number
  totalInventoryQuantity: number
  totalInventoryValue: number
  lowStockItems: number
  transfersThisMonth: number
}

export interface WarehouseInventoryReportRow {
  warehouseId: string
  warehouseName: string
  totalProducts: number
  totalQuantity: number
  inventoryValue: number
}

export interface WarehouseLocation {
  id: string
  warehouseId: string
  warehouseName: string
  section: string
  rack: string
  bin: string
  description: string
}

export interface CreateLocationInput {
  warehouseId: string
  section: string
  rack: string
  bin: string
  description: string
}

export interface UpdateLocationInput extends CreateLocationInput {}

export interface LocationListFilters {
  search?: string
  warehouseId?: string | 'all'
  page?: number
  limit?: number
}

export interface LocationListResult {
  data: WarehouseLocation[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface WarehouseStockRecord {
  id: string
  warehouseId: string
  warehouseName: string
  locationId: string
  section: string
  rack: string
  bin: string
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  brand: string
  color: string
  categoryId: string
  quantity: number
  unitCost: number
}

export interface CreateWarehouseStockInput {
  warehouseId: string
  locationId?: string
  productName: string
  brand: string
  color: string
  quantity: number
  notes?: string
  userId: string
  userName: string
}

export interface InventoryLocationFilters {
  search?: string
  warehouseId?: string | 'all'
  categoryId?: string | 'all'
  stockStatus?: 'all' | 'low' | 'in_stock'
  page?: number
  limit?: number
}

export interface InventoryLocationListResult {
  data: WarehouseStockRecord[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ProductLocatorResult {
  productId: string
  productName: string
  brand: string
  color: string
  variantName: string
  productVariantId: string
  locations: Array<{
    warehouseId: string
    warehouseName: string
    quantity: number
  }>
  totalQuantity: number
}

export type ProductAvailabilityStatus = 'available' | 'out_of_stock' | 'not_found'

export interface ProductAvailabilitySearchResult {
  status: ProductAvailabilityStatus
  message: string
  query: string
  results: ProductLocatorResult[]
  catalogMatches?: Array<{
    productId: string
    productName: string
    brand: string
    color: string
    productVariantId: string
  }>
}

export interface WarehouseTransfer {
  id: string
  transferNumber: string
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  quantity: number
  reason: string
  notes: string
  userId: string
  userName: string
  createdAt: string
}

export interface CreateTransferInput {
  fromWarehouseId: string
  toWarehouseId: string
  productId: string
  productVariantId: string
  quantity: number
  reason: string
  notes: string
  userId: string
  userName: string
}

export interface TransferListFilters {
  page?: number
  limit?: number
}

export interface TransferListResult {
  data: WarehouseTransfer[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
