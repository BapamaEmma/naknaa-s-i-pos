export const SUPPLIER_API_ENDPOINTS = {
  LIST: '/suppliers',
  DETAIL: (id: string) => `/suppliers/${id}`,
  CREATE: '/suppliers',
  UPDATE: (id: string) => `/suppliers/${id}`,
  DELETE: (id: string) => `/suppliers/${id}`,
  PRODUCTS: (supplierId: string) => `/suppliers/${supplierId}/products`,
  PRODUCT_DETAIL: (supplierId: string, supplyId: string) =>
    `/suppliers/${supplierId}/products/${supplyId}`,
} as const

export const SUPPLIER_ROUTES = {
  LIST: '/suppliers',
  CREATE: '/suppliers/create',
  DETAIL: (id: string) => `/suppliers/${id}`,
  EDIT: (id: string) => `/suppliers/${id}/edit`,
  PRODUCT_CREATE: (supplierId: string) => `/suppliers/${supplierId}/products/create`,
  PRODUCT_DETAIL: (supplierId: string, supplyId: string) =>
    `/suppliers/${supplierId}/products/${supplyId}`,
  PRODUCT_EDIT: (supplierId: string, supplyId: string) =>
    `/suppliers/${supplierId}/products/${supplyId}/edit`,
} as const

export const SUPPLIER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const
