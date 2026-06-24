export const PURCHASE_ROUTES = {
  LIST: '/purchases',
  CREATE: '/purchases/create',
  DETAIL: (id: string) => `/purchases/${id}`,
  EDIT: (id: string) => `/purchases/${id}/edit`,
  ORDERS: '/purchases/orders',
  RECEIVE: '/purchases/receive',
} as const

export const PURCHASE_API_ENDPOINTS = {
  LIST: '/purchases',
  DETAIL: (id: string) => `/purchases/${id}`,
  ORDERS: '/purchases/orders',
  RECEIVE: '/purchases/receive',
  DASHBOARD: '/purchases/dashboard',
  REPORTS: '/purchases/reports',
} as const

export const PURCHASE_STATUS_LABELS = {
  draft: 'Draft',
  ordered: 'Ordered',
  partially_received: 'Partially Received',
  received: 'Received',
  cancelled: 'Cancelled',
} as const

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
} as const

export const PURCHASE_ORDER_STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  cancelled: 'Cancelled',
} as const

export const DEFAULT_TAX_RATE = 0.15
