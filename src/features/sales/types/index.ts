export type PaymentMethod = 'cash' | 'mobile_money'

export type SaleStatus = 'completed' | 'voided' | 'refunded'

export type CustomerMode = 'walk_in' | 'existing' | 'new'

export interface SalesCustomerOption {
  id: string
  name: string
  phone: string
}

export interface Customer extends SalesCustomerOption {
  createdAt: string
}

export interface Sale {
  id: string
  receiptNumber: string
  branchId: string
  branchName: string
  customerId: string | null
  customerName: string
  customerPhone: string
  cashierId: string
  cashierName: string
  paymentMethod: PaymentMethod
  subtotal: number
  discount: number
  totalAmount: number
  saleDate: string
  status: SaleStatus
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  productVariantId: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SaleDetail extends Sale {
  items: SaleItem[]
}

export interface SaleListItem extends Sale {}

export interface CartItem {
  productId: string
  productVariantId: string
  productName: string
  variantName: string
  brand: string
  sku: string
  imageUrl: string
  quantity: number
  unitPrice: number
  availableStock: number
}

export interface PosProductResult {
  productId: string
  productVariantId: string
  productName: string
  variantName: string
  brand: string
  sku: string
  imageUrl: string
  sellingPrice: number
  availableStock: number
}

export interface CreateSaleItemInput {
  productVariantId: string
  quantity: number
  unitPrice: number
}

export interface CreateSaleInput {
  branchId: string
  customerId?: string | null
  customerName: string
  customerPhone: string
  paymentMethod: PaymentMethod
  discount: number
  items: CreateSaleItemInput[]
  cashierId: string
  cashierName: string
}

export interface SalesListFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
  cashierId?: string
  paymentMethod?: PaymentMethod | 'all'
  page?: number
  limit?: number
}

export interface SalesListResult {
  data: SaleListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SalesDashboardSummary {
  todaySales: number
  todayTransactions: number
  weeklyRevenue: number
  monthlyRevenue: number
}

export interface ReceiptData extends SaleDetail {}

export interface AuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userName: string
  details: string
  createdAt: string
}

export interface CashierOption {
  id: string
  name: string
}
