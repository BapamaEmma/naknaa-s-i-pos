import type {
  BrandOption,
  CreateProductInput,
  Product,
  ProductDetail,
  ProductListFilters,
  ProductListItem,
  ProductListResult,
  UpdateProductInput,
} from '@/features/products/types'
import {
  SEED_PRODUCTS,
  SEED_VARIANTS,
  buildInventorySummary,
  getCategoryMap,
} from '@/services/products/mock-data'
import { CATEGORY_STORAGE_KEY, SEED_CATEGORIES } from '@/services/categories/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'

function loadProducts(): Product[] {
  return readStorage(MOCK_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
}

function loadVariants() {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function saveProducts(products: Product[]): void {
  writeStorage(MOCK_STORAGE_KEYS.PRODUCTS, products)
}

function enrichProduct(product: Product): ProductListItem {
  const categories = readStorage(CATEGORY_STORAGE_KEY, SEED_CATEGORIES)
  const variants = loadVariants().filter((variant) => variant.productId === product.id)
  const categoryMap = getCategoryMap(categories)

  return {
    ...product,
    categoryName: categoryMap.get(product.categoryId)?.name ?? 'Unknown',
    variantCount: variants.length,
  }
}

function filterProducts(products: Product[], filters: ProductListFilters): Product[] {
  const search = filters.search?.trim().toLowerCase()

  return products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search) ||
      product.model.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search)

    const matchesCategory = !filters.categoryId || product.categoryId === filters.categoryId

    const matchesBrand =
      !filters.brand || filters.brand === 'all' || product.brand === filters.brand

    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      (filters.status === 'active' && product.isActive) ||
      (filters.status === 'inactive' && !product.isActive)

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus
  })
}

export const productService = {
  async getProducts(filters: ProductListFilters = {}): Promise<ProductListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterProducts(loadProducts(), filters).map(enrichProduct)
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  async getProductById(id: string): Promise<ProductDetail | null> {
    await delay(200)

    const product = loadProducts().find((item) => item.id === id)
    if (!product) return null

    const categories = readStorage(CATEGORY_STORAGE_KEY, SEED_CATEGORIES)
    const categoryMap = getCategoryMap(categories)
    const variants = loadVariants().filter((variant) => variant.productId === id)

    return {
      ...product,
      categoryName: categoryMap.get(product.categoryId)?.name ?? 'Unknown',
      variants,
      inventorySummary: buildInventorySummary(variants),
    }
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    await delay()

    const products = loadProducts()
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    saveProducts([product, ...products])
    return product
  },

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    await delay()

    const products = loadProducts()
    const index = products.findIndex((product) => product.id === id)

    if (index === -1) {
      throw new Error('Product not found')
    }

    const updated: Product = { ...products[index], ...input }
    products[index] = updated
    saveProducts(products)
    return updated
  },

  async deleteProduct(id: string): Promise<void> {
    await delay()

    const products = loadProducts()
    const nextProducts = products.filter((product) => product.id !== id)

    if (nextProducts.length === products.length) {
      throw new Error('Product not found')
    }

    saveProducts(nextProducts)

    const variants = loadVariants().filter((variant) => variant.productId !== id)
    writeStorage(MOCK_STORAGE_KEYS.VARIANTS, variants)
  },

  async getBrands(): Promise<BrandOption[]> {
    await delay(150)

    const brands = [...new Set(loadProducts().map((product) => product.brand))]
      .filter(Boolean)
      .sort()
      .map((brand) => ({ value: brand, label: brand }))

    return brands
  },
}
