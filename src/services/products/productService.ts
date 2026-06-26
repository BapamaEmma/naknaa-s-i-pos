import type {
  BrandOption,
  CreateProductInput,
  Product,
  ProductDetail,
  ProductListFilters,
  ProductListResult,
  UpdateProductInput,
} from '@/features/products/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import {
  mapProductDetail,
  mapProductListItem,
  toCreateProductPayload,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function buildQuery(filters: ProductListFilters = {}) {
  return {
    search: filters.search,
    categoryId: filters.categoryId,
    brand: filters.brand && filters.brand !== 'all' ? filters.brand : undefined,
    isActive:
      filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 12,
  }
}

export const productService = {
  async getProducts(filters: ProductListFilters = {}): Promise<ProductListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.products, {
      params: buildQuery(filters),
    })

    const mapped = toPagedMeta(
      {
        ...result,
        items: result.items.map((item) => mapProductListItem(item)),
      },
      filters.limit ?? 12,
    )

    return mapped as ProductListResult
  },

  async getProductById(id: string): Promise<ProductDetail | null> {
    try {
      const result = await apiGet<Record<string, unknown>>(API_ENDPOINTS.product(id))
      return mapProductDetail(result)
    } catch {
      return null
    }
  },

  async createProduct(input: CreateProductInput & { sellingPrice?: number; costPrice?: number }): Promise<Product> {
    const payload = toCreateProductPayload({
      name: input.name,
      categoryId: input.categoryId,
      brand: input.brand,
      model: input.model,
      costPrice: input.costPrice ?? 0,
      sellingPrice: input.sellingPrice ?? 0,
      isActive: input.isActive,
      imageUrl: input.imageUrl,
    })

    const result = await apiPost<Record<string, unknown>>(API_ENDPOINTS.products, payload)
    return mapProductListItem(result)
  },

  async updateProduct(id: string, input: UpdateProductInput & { sellingPrice?: number; costPrice?: number }): Promise<Product> {
    const existing = await this.getProductById(id)
    if (!existing) throw new Error('Product not found')

    const primaryVariant = existing.variants[0]

    const payload = toCreateProductPayload({
      name: input.name ?? existing.name,
      categoryId: input.categoryId ?? existing.categoryId,
      brand: input.brand ?? existing.brand,
      model: input.model ?? existing.model,
      costPrice: input.costPrice ?? primaryVariant?.costPrice ?? 0,
      sellingPrice: input.sellingPrice ?? primaryVariant?.sellingPrice ?? 0,
      isActive: input.isActive ?? existing.isActive,
      imageUrl: input.imageUrl ?? existing.imageUrl,
    })

    const result = await apiPut<Record<string, unknown>>(API_ENDPOINTS.product(id), payload)
    return mapProductListItem(result)
  },

  async deleteProduct(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.product(id))
  },

  async getBrands(): Promise<BrandOption[]> {
    const brands = await apiGet<Array<{ value: string; label: string }>>(API_ENDPOINTS.productBrands)
    return brands.map((brand) => ({ value: brand.value, label: brand.label }))
  },
}
