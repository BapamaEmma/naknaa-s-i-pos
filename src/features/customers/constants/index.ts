export const CUSTOMER_API_ENDPOINTS = {
  LIST: '/customers',
  DETAIL: (id: string) => `/customers/${id}`,
  CREATE: '/customers',
  UPDATE: (id: string) => `/customers/${id}`,
  DELETE: (id: string) => `/customers/${id}`,
  PURCHASES: (id: string) => `/customers/${id}/purchases`,
  SUMMARY: '/customers/summary',
} as const

export const CUSTOMER_ROUTES = {
  LIST: '/customers',
  CREATE: '/customers/create',
  DETAIL: (id: string) => `/customers/${id}`,
  EDIT: (id: string) => `/customers/${id}/edit`,
  PURCHASES: (id: string) => `/customers/${id}/purchases`,
} as const

export const CUSTOMER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const
