import { formatCurrency } from '@/lib/format'
import type { ProductVariant } from '@/features/products/types'

export interface ProductPricingSummary {
  costPrice: { min: number; max: number }
  sellingPrice: { min: number; max: number }
  isSingle: boolean
  singleVariant: ProductVariant | null
}

export function getProductPricingSummary(variants: ProductVariant[]): ProductPricingSummary | null {
  if (variants.length === 0) return null

  const activeVariants = variants.filter((variant) => variant.isActive)
  const pool = activeVariants.length > 0 ? activeVariants : variants

  const costPrices = pool.map((variant) => variant.costPrice)
  const sellingPrices = pool.map((variant) => variant.sellingPrice)

  return {
    costPrice: { min: Math.min(...costPrices), max: Math.max(...costPrices) },
    sellingPrice: { min: Math.min(...sellingPrices), max: Math.max(...sellingPrices) },
    isSingle: pool.length === 1,
    singleVariant: pool.length === 1 ? pool[0] : null,
  }
}

export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}
