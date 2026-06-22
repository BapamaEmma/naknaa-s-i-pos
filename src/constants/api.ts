export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  TIMEOUT: 30_000,
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'naknaa_access_token',
  REFRESH_TOKEN: 'naknaa_refresh_token',
  USER: 'naknaa_user',
} as const

export const QUERY_KEYS = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  PRODUCT_VARIANTS: 'product-variants',
  CATEGORIES: 'categories',
  INVENTORY: 'inventory',
  INVENTORY_HISTORY: 'inventory-history',
  INVENTORY_SUMMARY: 'inventory-summary',
  CUSTOMERS: 'customers',
  CUSTOMERS_SUMMARY: 'customers-summary',
  CUSTOMER_PURCHASES: 'customer-purchases',
  SALES: 'sales',
  SALES_SUMMARY: 'sales-summary',
  SALES_RECEIPT: 'sales-receipt',
  SUPPLIERS: 'suppliers',
  PURCHASES: 'purchases',
  REPORTS: 'reports',
  USERS: 'users',
  BRANCHES: 'branches',
  AUDIT_LOGS: 'audit-logs',
  SETTINGS: 'settings',
} as const
