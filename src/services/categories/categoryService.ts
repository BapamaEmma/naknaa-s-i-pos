import type {
  Category,
  CategoryDetail,
  CategoryListFilters,
  CategoryListItem,
  CategoryListResult,
  CategoryProductSummary,
  CategoryStatistics,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/features/categories/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/http'
import { mapCategory, mapProductListItem } from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function filterCategories(categories: Category[], filters: CategoryListFilters): Category[] {
  const search = filters.search?.trim().toLowerCase()
  const status = filters.status ?? 'all'

  return categories.filter((category) => {
    const matchesSearch =
      !search ||
      category.name.toLowerCase().includes(search) ||
      category.description.toLowerCase().includes(search)

    const matchesStatus =
      status === 'all' ||
      (status === 'active' && category.isActive) ||
      (status === 'inactive' && !category.isActive)

    return matchesSearch && matchesStatus
  })
}

function sortCategories(categories: Category[], filters: CategoryListFilters): Category[] {
  const sortBy = filters.sortBy ?? 'name'
  const sortOrder = filters.sortOrder ?? 'asc'
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...categories].sort((left, right) => {
    if (sortBy === 'createdAt') {
      return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction
    }

    return left.name.localeCompare(right.name) * direction
  })
}

async function fetchCategoryProductSummaries(categoryId: string): Promise<CategoryProductSummary[]> {
  const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.products, {
    params: { categoryId, page: 1, pageSize: 500 },
  })

  return result.items.map((item) => {
    const product = mapProductListItem(item)
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      isActive: product.isActive,
    }
  })
}

function buildStatistics(products: CategoryProductSummary[]): CategoryStatistics {
  return {
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.isActive).length,
    lowStockProducts: 0,
  }
}

function toCreateCategoryPayload(input: CreateCategoryInput) {
  return {
    name: input.name,
    description: input.description,
    isActive: input.isActive ?? true,
  }
}

function toUpdateCategoryPayload(input: UpdateCategoryInput, current: Category) {
  return {
    name: input.name ?? current.name,
    description: input.description ?? current.description,
    isActive: input.isActive ?? current.isActive,
  }
}

export const categoryService = {
  async getCategories(filters: CategoryListFilters = {}): Promise<CategoryListResult> {
    const [categories, productsResult] = await Promise.all([
      this.getAllCategories(),
      apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.products, {
        params: { page: 1, pageSize: 500 },
      }),
    ])

    const countMap = new Map<string, number>()
    for (const item of productsResult.items) {
      const product = mapProductListItem(item)
      countMap.set(product.categoryId, (countMap.get(product.categoryId) ?? 0) + 1)
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = sortCategories(filterCategories(categories, filters), filters).map(
      (category): CategoryListItem => ({
        ...category,
        totalProducts: countMap.get(category.id) ?? 0,
      }),
    )

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async getAllCategories(): Promise<Category[]> {
    const result = await apiGet<Record<string, unknown>[]>(API_ENDPOINTS.categories)
    return result.map((item) => mapCategory(item))
  },

  async getCategoryById(id: string): Promise<CategoryDetail | null> {
    const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.category(id))
    const category = mapCategory(result)
    const products = await fetchCategoryProductSummaries(id)

    return {
      ...category,
      products,
      statistics: buildStatistics(products),
    }
  },

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const result = await apiPost<Record<string, unknown>>(
      API_ENDPOINTS.categories,
      toCreateCategoryPayload(input),
    )
    return mapCategory(result)
  },

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await apiGet<Record<string, unknown>>(API_ENDPOINTS.category(id))
    const current = mapCategory(existing)

    const result = await apiPut<Record<string, unknown>>(
      API_ENDPOINTS.category(id),
      toUpdateCategoryPayload(input, current),
    )
    return mapCategory(result)
  },

  async deleteCategory(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.category(id))
  },
}
