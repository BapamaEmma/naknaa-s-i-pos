export { CATEGORY_API_ENDPOINTS } from '@/features/categories/constants'

export const PRODUCT_API_ENDPOINTS = {
  LIST: '/products',
  DETAIL: (id: string) => `/products/${id}`,
  CREATE: '/products',
  UPDATE: (id: string) => `/products/${id}`,
  DELETE: (id: string) => `/products/${id}`,
} as const

export const VARIANT_API_ENDPOINTS = {
  LIST: (productId: string) => `/products/${productId}/variants`,
  CREATE: (productId: string) => `/products/${productId}/variants`,
  UPDATE: (productId: string, variantId: string) => `/products/${productId}/variants/${variantId}`,
  DELETE: (productId: string, variantId: string) => `/products/${productId}/variants/${variantId}`,
} as const

export const PRODUCT_ROUTES = {
  LIST: '/products',
  CREATE: '/products/create',
  DETAIL: (id: string) => `/products/${id}`,
  EDIT: (id: string) => `/products/${id}/edit`,
  VARIANTS: (id: string) => `/products/${id}/variants`,
} as const
