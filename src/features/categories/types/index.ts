export interface Category {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export interface CategoryListFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CategoryListItem extends Category {
  totalProducts: number
}

export interface CategoryListResult {
  data: CategoryListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CategoryProductSummary {
  id: string
  name: string
  brand: string
  isActive: boolean
}

export interface CategoryStatistics {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
}

export interface CategoryDetail extends Category {
  products: CategoryProductSummary[]
  statistics: CategoryStatistics
}
