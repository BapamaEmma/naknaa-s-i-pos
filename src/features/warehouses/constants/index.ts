export const WAREHOUSE_API_ENDPOINTS = {
  LIST: '/warehouses',
  DETAIL: (id: string) => `/warehouses/${id}`,
  CREATE: '/warehouses',
  UPDATE: (id: string) => `/warehouses/${id}`,
  DELETE: (id: string) => `/warehouses/${id}`,
  LOCATIONS: '/warehouses/locations',
  TRANSFERS: '/warehouses/transfers',
  DASHBOARD: '/warehouses/dashboard',
  LOCATE: '/warehouses/locate',
} as const

export const WAREHOUSE_ROUTES = {
  LIST: '/warehouses',
  CREATE: '/warehouses/create',
  DETAIL: (id: string) => `/warehouses/${id}`,
  EDIT: (id: string) => `/warehouses/${id}/edit`,
  LOCATIONS: '/warehouses/locations',
  TRANSFERS: '/warehouses/transfers',
  STOCK_ENTRY: '/warehouses/stock-entry',
} as const

export const WAREHOUSE_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const

export const LOW_STOCK_THRESHOLD = 5

export const TRANSFER_REASONS = [
  'Restock',
  'Rebalance',
  'Customer Order Fulfillment',
  'Damaged Stock Replacement',
  'Other',
] as const
