export const MOCK_STORAGE_KEYS = {
  CATEGORIES: 'naknaa_categories_v2',
  PRODUCTS: 'naknaa_products_v2',
  VARIANTS: 'naknaa_product_variants_v2',
} as const

export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function readStorage<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key)
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback))
    return structuredClone(fallback)
  }

  try {
    return JSON.parse(stored) as T
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback))
    return structuredClone(fallback)
  }
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
