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

export interface CreateVariantInput {
  productId: string
  name: string
  variantType: string
  costPrice: number
  sellingPrice: number
  currentStock?: number
  minimumStock: number
  isActive?: boolean
}

export type UpdateVariantInput = Partial<Omit<CreateVariantInput, 'productId'>>

export interface VariantListFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
}
