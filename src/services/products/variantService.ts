import type {
  CreateVariantInput,
  ProductVariant,
  UpdateVariantInput,
} from '@/features/products/types'
import { SEED_VARIANTS } from '@/services/products/mock-data'
import { delay, MOCK_STORAGE_KEYS, readStorage, writeStorage } from '@/services/products/storage'

function loadVariants(): ProductVariant[] {
  return readStorage(MOCK_STORAGE_KEYS.VARIANTS, SEED_VARIANTS)
}

function saveVariants(variants: ProductVariant[]): void {
  writeStorage(MOCK_STORAGE_KEYS.VARIANTS, variants)
}

export const variantService = {
  async getVariants(productId: string): Promise<ProductVariant[]> {
    await delay(200)
    return loadVariants().filter((variant) => variant.productId === productId)
  },

  async createVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
    await delay()

    const variants = loadVariants()
    const now = new Date().toISOString()
    const variant: ProductVariant = {
      ...input,
      id: crypto.randomUUID(),
      productId,
      createdAt: now,
      updatedAt: now,
    }

    saveVariants([variant, ...variants])
    return variant
  },

  async updateVariant(
    productId: string,
    variantId: string,
    input: UpdateVariantInput,
  ): Promise<ProductVariant> {
    await delay()

    const variants = loadVariants()
    const index = variants.findIndex(
      (variant) => variant.productId === productId && variant.id === variantId,
    )

    if (index === -1) {
      throw new Error('Variant not found')
    }

    const updated: ProductVariant = {
      ...variants[index],
      ...input,
      updatedAt: new Date().toISOString(),
    }

    variants[index] = updated
    saveVariants(variants)
    return updated
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await delay()

    const variants = loadVariants()
    const nextVariants = variants.filter(
      (variant) => !(variant.productId === productId && variant.id === variantId),
    )

    if (nextVariants.length === variants.length) {
      throw new Error('Variant not found')
    }

    saveVariants(nextVariants)
  },
}
