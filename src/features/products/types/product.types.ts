export interface Product {
  id: string
  categoryId: string
  name: string
  brand: string
  model: string
  sku: string
  description: string
  warrantyMonths: number
  imageUrl: string
  isActive: boolean
  createdAt: string
}

export interface CreateProductInput {
  categoryId: string
  name: string
  brand: string
  model: string
  sku: string
  description: string
  warrantyMonths: number
  imageUrl: string
  isActive: boolean
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductListFilters {
  search?: string
  categoryId?: string
  brand?: string
  status?: 'all' | 'active' | 'inactive'
  page?: number
  limit?: number
}

export interface ProductListItem extends Product {
  categoryName: string
  variantCount: number
}

export interface ProductListResult {
  data: ProductListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductDetail extends Product {
  categoryName: string
}

export interface InventorySummary {
  totalStock: number
  inventoryValue: number
  lowStockVariants: number
}
