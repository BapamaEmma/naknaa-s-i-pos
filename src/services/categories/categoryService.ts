import { delay, readStorage, writeStorage } from '@/services/products/storage'
import { CATEGORY_STORAGE_KEY, SEED_CATEGORIES } from '@/services/categories/mock-data'
import type { Product, ProductVariant } from '@/features/products/types'
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
import { MOCK_STORAGE_KEYS } from '@/services/products/storage'
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/services/products/mock-data'

function loadCategories(): Category[] {
  return readStorage(CATEGORY_STORAGE_KEY, SEED_CATEGORIES)
}

function saveCategories(categories: Category[]): void {
  writeStorage(CATEGORY_STORAGE_KEY, categories)
}

function loadProducts(): Product[] {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants(): ProductVariant[] {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function countProducts(categoryId: string): number {
  return loadProducts().filter((product) => product.categoryId === categoryId).length
}

function buildStatistics(categoryId: string): CategoryStatistics {
  const products = loadProducts().filter((product) => product.categoryId === categoryId)
  const variants = loadVariants()

  const lowStockProducts = products.filter((product) => {
    const productVariants = variants.filter((variant) => variant.productId === product.id)
    return productVariants.some((variant) => variant.currentStock <= variant.minimumStock)
  }).length

  return {
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.isActive).length,
    lowStockProducts,
  }
}

function getCategoryProducts(categoryId: string): CategoryProductSummary[] {
  return loadProducts()
    .filter((product) => product.categoryId === categoryId)
    .map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      isActive: product.isActive,
    }))
}

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

export const categoryService = {
  async getCategories(filters: CategoryListFilters = {}): Promise<CategoryListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = sortCategories(filterCategories(loadCategories(), filters), filters).map(
      (category): CategoryListItem => ({
        ...category,
        totalProducts: countProducts(category.id),
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
    await delay(150)
    return loadCategories()
  },

  async getCategoryById(id: string): Promise<CategoryDetail | null> {
    await delay(200)

    const category = loadCategories().find((item) => item.id === id)
    if (!category) return null

    return {
      ...category,
      products: getCategoryProducts(id),
      statistics: buildStatistics(id),
    }
  },

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    await delay()

    const categories = loadCategories()
    const now = new Date().toISOString()
    const category: Category = {
      ...input,
      id: `cat-${slugify(input.name)}-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
    }

    saveCategories([category, ...categories])
    return category
  },

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    await delay()

    const categories = loadCategories()
    const index = categories.findIndex((category) => category.id === id)

    if (index === -1) {
      throw new Error('Category not found')
    }

    const updated: Category = {
      ...categories[index],
      ...input,
      updatedAt: new Date().toISOString(),
    }

    categories[index] = updated
    saveCategories(categories)
    return updated
  },

  async deleteCategory(id: string): Promise<void> {
    await delay()

    const productCount = countProducts(id)
    if (productCount > 0) {
      throw new Error('Cannot delete a category that has assigned products.')
    }

    const categories = loadCategories()
    const nextCategories = categories.filter((category) => category.id !== id)

    if (nextCategories.length === categories.length) {
      throw new Error('Category not found')
    }

    saveCategories(nextCategories)
  },
}
