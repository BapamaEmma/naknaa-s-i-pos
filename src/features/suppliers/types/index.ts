export interface Supplier {
  id: string
  name: string
  storeName: string
  suppliedToPerson: string
  email: string
  phoneNumber: string
  address: string
  city: string
  notes: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SupplierListItem {
  id: string
  name: string
  storeName: string
  email: string
  phoneNumber: string
  productCount: number
  totalPurchaseValue: number
  lastSupplyDate: string | null
  isActive: boolean
}

export interface SupplierStatistics {
  totalProductsSupplied: number
  totalQuantitySupplied: number
  totalPurchaseValue: number
  lastSupplyDate: string | null
}

export interface SupplierAnalytics {
  mostSuppliedProduct: string
  totalQuantitySupplied: number
  totalPurchaseValue: number
  recentSupplies: SupplierProductListItem[]
}

export interface SupplierDetail extends Supplier {
  stats: SupplierStatistics
  analytics: SupplierAnalytics
}

export interface SupplierListFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  page?: number
  limit?: number
}

export interface SupplierListResult {
  data: SupplierListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateSupplierInput {
  name: string
  storeName: string
  suppliedToPerson: string
  email: string
  phoneNumber: string
  address: string
  city: string
  notes: string
  isActive: boolean
  items?: SupplierSupplyItemInput[]
}

export interface SupplierSupplyItemInput {
  productName: string
  quantity: number
  color?: string
}

export interface UpdateSupplierInput extends CreateSupplierInput {}

export interface SupplierOption {
  id: string
  name: string
}

export interface SupplierProduct {
  id: string
  supplierId: string
  supplierName: string
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  quantitySupplied: number
  costPrice: number
  dateSupplied: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface SupplierProductListItem {
  id: string
  supplierId: string
  supplierName: string
  productId: string
  productName: string
  productVariantId: string
  variantName: string
  quantitySupplied: number
  costPrice: number
  totalCost: number
  dateSupplied: string
  notes: string
}

export interface SupplierProductDetail extends SupplierProduct {
  totalCost: number
}

export interface SupplierProductListFilters {
  supplierId?: string
  search?: string
  page?: number
  limit?: number
}

export interface SupplierProductListResult {
  data: SupplierProductListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateSupplierProductInput {
  supplierId: string
  productId: string
  productVariantId: string
  quantitySupplied: number
  costPrice: number
  dateSupplied: string
  notes: string
}

export interface UpdateSupplierProductInput {
  productId: string
  productVariantId: string
  quantitySupplied: number
  costPrice: number
  dateSupplied: string
  notes: string
}
