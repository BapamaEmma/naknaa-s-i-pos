export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type TransactionType =
  | 'stock_in'
  | 'stock_out'
  | 'sale'
  | 'purchase'
  | 'adjustment'
  | 'transfer'

export interface Branch {
  id: string
  name: string
  code: string
  isActive: boolean
}

export interface InventoryRecord {
  id: string
  branchId: string
  productVariantId: string
  quantity: number
  minimumStockLevel: number
  lastUpdated: string
}

export interface InventoryListItem extends InventoryRecord {
  productId: string
  productName: string
  variantName: string
  variantType: string
  categoryId: string
  categoryName: string
  brand: string
  sku: string
  branchName: string
  unitCost: number
  status: InventoryStatus
  stockValue: number
}

export interface InventoryListFilters {
  search?: string
  categoryId?: string
  branchId?: string
  status?: 'all' | InventoryStatus
  page?: number
  limit?: number
}

export interface InventoryListResult {
  data: InventoryListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface InventoryDashboardSummary {
  totalProducts: number
  totalStockQuantity: number
  inventoryValue: number
  lowStockProducts: number
  outOfStockProducts: number
}

export interface InventoryTransaction {
  id: string
  inventoryId: string
  branchId: string
  productId: string
  productVariantId: string
  productName: string
  variantName: string
  branchName: string
  transactionType: TransactionType
  quantity: number
  previousQuantity: number
  newQuantity: number
  unitCost?: number
  supplier?: string
  reason?: string
  notes?: string
  userId: string
  userName: string
  referenceNumber: string
  createdAt: string
}

export interface InventoryHistoryFilters {
  search?: string
  branchId?: string
  productId?: string
  transactionType?: TransactionType | 'all'
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface InventoryHistoryResult {
  data: InventoryTransaction[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StockInInput {
  productId: string
  productVariantId: string
  branchId: string
  quantity: number
  unitCost: number
  supplier: string
  notes?: string
  userId: string
  userName: string
}

export interface StockOutInput {
  productId: string
  productVariantId: string
  branchId: string
  quantity: number
  reason: string
  notes?: string
  userId: string
  userName: string
}

export interface InventoryAdjustmentInput {
  productId: string
  productVariantId: string
  branchId: string
  newQuantity: number
  reason: string
  userId: string
  userName: string
}

export interface SaleStockDeductionInput {
  branchId: string
  productVariantId: string
  quantity: number
  receiptNumber: string
  userId: string
  userName: string
}

export interface ProductOption {
  id: string
  name: string
  sku: string
}

export interface VariantOption {
  id: string
  productId: string
  name: string
  currentQuantity: number
  minimumStock: number
  unitCost: number
}
