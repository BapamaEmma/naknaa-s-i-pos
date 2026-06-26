export type { Category } from '@/features/categories/types'

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

export interface ProductVariant {
  id: string
  productId: string
  name: string
  variantType: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  minimumStock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt'>

export type UpdateProductInput = Partial<CreateProductInput>

export type CreateVariantInput = Omit<
  ProductVariant,
  'id' | 'productId' | 'createdAt' | 'updatedAt'
>

export type UpdateVariantInput = Partial<CreateVariantInput>

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
  sellingPrice: number
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
  variants: ProductVariant[]
  inventorySummary: InventorySummary
}

export interface InventorySummary {
  totalStock: number
  inventoryValue: number
  lowStockVariants: number
}

export interface BrandOption {
  value: string
  label: string
}
