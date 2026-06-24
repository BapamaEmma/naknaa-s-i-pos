import { ROUTES } from '@/constants/routes'
import { USER_ROLES } from '@/constants/roles'

export const REPORT_ROUTES = {
  ROOT: ROUTES.REPORTS,
  SALES: '/reports/sales',
  INVENTORY: '/reports/inventory',
  PURCHASES: '/reports/purchases',
  WAREHOUSES: '/reports/warehouses',
  CUSTOMERS: '/reports/customers',
  SUPPLIERS: '/reports/suppliers',
  SERVICES: '/reports/services',
  USERS: '/reports/users',
  PROFIT_LOSS: '/reports/profit-loss',
} as const

export const REPORT_API_ENDPOINTS = {
  DASHBOARD: '/reports/dashboard',
  SALES: '/reports/sales',
  INVENTORY: '/reports/inventory',
  PURCHASES: '/reports/purchases',
  WAREHOUSES: '/reports/warehouses',
  CUSTOMERS: '/reports/customers',
  SUPPLIERS: '/reports/suppliers',
  SERVICES: '/reports/services',
  USERS: '/reports/users',
  PROFIT_LOSS: '/reports/profit-loss',
} as const

export const REPORT_NAV_ITEMS = [
  { title: 'Overview', href: REPORT_ROUTES.ROOT, description: 'Business summary and quick links' },
  { title: 'Sales', href: REPORT_ROUTES.SALES, description: 'Revenue, transactions, and cashier performance' },
  { title: 'Inventory', href: REPORT_ROUTES.INVENTORY, description: 'Stock levels, valuation, and movement' },
  { title: 'Purchases', href: REPORT_ROUTES.PURCHASES, description: 'Supplier and warehouse purchase analysis' },
  { title: 'Warehouses', href: REPORT_ROUTES.WAREHOUSES, description: 'Chairman Down, Chairman Top, Nasoo, Masalachi' },
  { title: 'Customers', href: REPORT_ROUTES.CUSTOMERS, description: 'Top customers and spending patterns' },
  { title: 'Suppliers', href: REPORT_ROUTES.SUPPLIERS, description: 'Supplier performance and purchase history' },
  { title: 'Services', href: REPORT_ROUTES.SERVICES, description: 'Service jobs, categories, and technicians' },
  { title: 'Users', href: REPORT_ROUTES.USERS, description: 'Login activity and user actions' },
  { title: 'Profit & Loss', href: REPORT_ROUTES.PROFIT_LOSS, description: 'Revenue, expenses, and estimated profit' },
] as const

/** Cashier / shop staff can access these report routes only. */
export const BASIC_REPORT_ROUTES = [
  REPORT_ROUTES.ROOT,
  REPORT_ROUTES.SALES,
  REPORT_ROUTES.INVENTORY,
] as const

export const ADMIN_ONLY_REPORT_ROUTES = [
  REPORT_ROUTES.PURCHASES,
  REPORT_ROUTES.WAREHOUSES,
  REPORT_ROUTES.CUSTOMERS,
  REPORT_ROUTES.SUPPLIERS,
  REPORT_ROUTES.SERVICES,
  REPORT_ROUTES.USERS,
  REPORT_ROUTES.PROFIT_LOSS,
] as const

export const WAREHOUSE_REPORT_NAMES = [
  'Chairman Down',
  'Chairman Top',
  'Nasoo',
  'Masalachi',
] as const

export const REPORT_PRODUCT_CATEGORIES = [
  'Speakers',
  'Guitars',
  'Keyboards',
  'Mixers',
] as const

export function canAccessReportRoute(role: string, path: string): boolean {
  if (role === USER_ROLES.ADMIN) {
    return Object.values(REPORT_ROUTES).some(
      (route) => path === route || path.startsWith(`${route}/`),
    )
  }

  return BASIC_REPORT_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

export function canExportReports(role: string): boolean {
  return role === USER_ROLES.ADMIN
}
