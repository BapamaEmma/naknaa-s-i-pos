export const CATEGORY_API_ENDPOINTS = {
  LIST: '/categories',
  DETAIL: (id: string) => `/categories/${id}`,
  CREATE: '/categories',
  UPDATE: (id: string) => `/categories/${id}`,
  DELETE: (id: string) => `/categories/${id}`,
} as const

export const CATEGORY_ROUTES = {
  LIST: '/categories',
  CREATE: '/categories/create',
  DETAIL: (id: string) => `/categories/${id}`,
  EDIT: (id: string) => `/categories/${id}/edit`,
} as const

export const CATEGORY_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const
