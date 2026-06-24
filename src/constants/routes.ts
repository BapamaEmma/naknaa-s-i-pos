import { USER_ROLES, type UserRole } from '@/constants/roles'
import { SALES_ROUTES } from '@/features/sales/constants'

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  SALES: '/sales',
  SUPPLIERS: '/suppliers',
  PURCHASES: '/purchases',
  REPORTS: '/reports',
  USERS: '/users',
  BRANCHES: '/branches',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
  WAREHOUSES: '/warehouses',
  SERVICES: '/services',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export const PUBLIC_ROUTES: RoutePath[] = [ROUTES.LOGIN]

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.DASHBOARD

export const DEFAULT_UNAUTHENTICATED_ROUTE = ROUTES.LOGIN

export function getDefaultAuthenticatedRoute(role?: UserRole): string {
  if (role === USER_ROLES.CASHIER) {
    return SALES_ROUTES.NEW
  }

  return ROUTES.DASHBOARD
}
