import type { PaymentMethod } from '@/features/sales/types'

export const SALES_API_ENDPOINTS = {
  LIST: '/sales',
  DETAIL: (id: string) => `/sales/${id}`,
  CREATE: '/sales',
  RECEIPT: (id: string) => `/sales/${id}/receipt`,
  REPRINT: (id: string) => `/sales/${id}/receipt`,
  SUMMARY: '/sales/summary',
  PRODUCTS: '/sales/products',
  CUSTOMERS: '/sales/customers',
} as const

export const SALES_ROUTES = {
  NEW: '/sales/new',
  HISTORY: '/sales/history',
  DETAIL: (id: string) => `/sales/${id}`,
  RECEIPT: (id: string) => `/sales/${id}/receipt`,
} as const

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile Money' },
]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  mobile_money: 'Mobile Money',
}

export const WALK_IN_CUSTOMER = {
  id: 'walk-in',
  name: 'Walk-In Customer',
  phone: '-',
} as const

export const RECEIPT_WIDTHS = {
  MM_58: '58mm',
  MM_80: '80mm',
} as const

export type ReceiptWidth = (typeof RECEIPT_WIDTHS)[keyof typeof RECEIPT_WIDTHS]
