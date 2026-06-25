import type {
  CreateVariantInput,
  ProductVariant,
  UpdateVariantInput,
} from '@/features/products/types'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/http'
import { mapProductVariant } from '@/services/api/mappers'

export const variantService = {
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const variants = await apiGet<Record<string, unknown>[]>(
      API_ENDPOINTS.productVariants(productId),
    )
    return variants.map((variant) => mapProductVariant(variant))
  },

  async createVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
    const result = await apiPost<Record<string, unknown>>(
      API_ENDPOINTS.productVariants(productId),
      {
        productId,
        variantName: input.name,
        variantValue: input.variantType,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        reorderLevel: input.minimumStock,
        initialStock: input.currentStock ?? 0,
        isActive: input.isActive,
      },
    )
    return mapProductVariant(result)
  },

  async updateVariant(
    productId: string,
    variantId: string,
    input: UpdateVariantInput,
  ): Promise<ProductVariant> {
    const result = await apiPut<Record<string, unknown>>(
      API_ENDPOINTS.productVariant(productId, variantId),
      {
        variantName: input.name,
        variantValue: input.variantType,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        reorderLevel: input.minimumStock,
        isActive: input.isActive,
      },
    )
    return mapProductVariant(result)
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.productVariant(productId, variantId))
  },
}
