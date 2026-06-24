export type PurchaseStatus = 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type PurchaseOrderStatus = 'draft' | 'sent' | 'approved' | 'cancelled'

export interface PurchaseItem {
  id: string
  purchaseId: string
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  quantity: number
  receivedQuantity: number
  costPrice: number
  totalCost: number
  section: string
  rack: string
  bin: string
}

export interface Purchase {
  id: string
  purchaseNumber: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  purchaseDate: string
  invoiceNumber: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentStatus: PaymentStatus
  purchaseStatus: PurchaseStatus
  notes: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseDetail extends Purchase {
  items: PurchaseItem[]
}

export interface PurchaseListItem extends Purchase {}

export interface PurchaseListFilters {
  search?: string
  warehouseId?: string | 'all'
  purchaseStatus?: PurchaseStatus | 'all'
  paymentStatus?: PaymentStatus | 'all'
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface PurchaseListResult {
  data: PurchaseListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface PurchaseItemInput {
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  quantity: number
  costPrice: number
  section: string
  rack: string
  bin: string
}

export interface CreatePurchaseInput {
  supplierId: string
  warehouseId: string
  purchaseDate: string
  invoiceNumber: string
  paymentStatus: PaymentStatus
  purchaseStatus: PurchaseStatus
  notes: string
  items: PurchaseItemInput[]
  userId: string
  userName: string
}

export type UpdatePurchaseInput = CreatePurchaseInput

export interface ReceivePurchaseItemInput {
  purchaseItemId: string
  quantity: number
}

export interface ReceivePurchaseInput {
  purchaseId: string
  items: ReceivePurchaseItemInput[]
  userId: string
  userName: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  quantity: number
  costPrice: number
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  status: PurchaseOrderStatus
  notes: string
  items: PurchaseOrderItem[]
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface CreatePurchaseOrderInput {
  supplierId: string
  warehouseId: string
  notes: string
  items: Omit<PurchaseOrderItem, 'id'>[]
  userId: string
  userName: string
}

export interface PurchaseDashboardSummary {
  totalPurchases: number
  purchaseValue: number
  pendingPurchases: number
  receivedPurchases: number
  unpaidPurchases: number
}

export interface PurchaseBySupplierReport {
  supplierId: string
  supplierName: string
  totalPurchases: number
  totalAmount: number
}

export interface PurchaseByWarehouseReport {
  warehouseId: string
  warehouseName: string
  totalPurchases: number
  totalAmount: number
}

export interface MonthlyPurchaseReport {
  month: string
  purchases: number
  value: number
}

export interface PurchaseReports {
  totalPurchases: number
  totalPurchaseValue: number
  bySupplier: PurchaseBySupplierReport[]
  byWarehouse: PurchaseByWarehouseReport[]
  monthly: MonthlyPurchaseReport[]
}

export interface SupplierPurchaseHistoryItem {
  supplierId: string
  supplierName: string
  totalPurchases: number
  totalAmount: number
  lastPurchaseDate: string | null
}

export interface WarehousePurchaseSummaryItem {
  warehouseId: string
  warehouseName: string
  productsReceived: number
  inventoryValue: number
}
