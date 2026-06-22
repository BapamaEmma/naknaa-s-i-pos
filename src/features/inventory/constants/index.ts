export const INVENTORY_API_ENDPOINTS = {
  LIST: '/inventory',
  DETAIL: (id: string) => `/inventory/${id}`,
  STOCK_IN: '/inventory/stock-in',
  STOCK_OUT: '/inventory/stock-out',
  ADJUSTMENT: '/inventory/adjustment',
  HISTORY: '/inventory/history',
  LOW_STOCK: '/inventory/low-stock',
} as const

export const INVENTORY_ROUTES = {
  DASHBOARD: '/inventory',
  STOCK_IN: '/inventory/stock-in',
  STOCK_OUT: '/inventory/stock-out',
  ADJUSTMENT: '/inventory/adjustment',
  HISTORY: '/inventory/history',
  LOW_STOCK: '/inventory/low-stock',
} as const

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  stock_in: 'Stock In',
  stock_out: 'Stock Out',
  sale: 'Sale',
  purchase: 'Purchase',
  adjustment: 'Adjustment',
  transfer: 'Transfer',
}

export const STOCK_OUT_REASONS = [
  'Damage',
  'Lost',
  'Internal Use',
  'Return',
  'Other',
] as const

export const MOCK_SUPPLIERS = [
  'NakNaa Distributors',
  'JBL Ghana',
  'Yamaha West Africa',
  'ProAudio Supplies',
  'Local Vendor',
] as const

export const DEFAULT_BRANCH_ID = 'branch-main'
