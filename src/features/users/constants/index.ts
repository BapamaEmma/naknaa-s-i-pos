import { USER_ROLES, ROLE_LABELS, type UserRole } from '@/constants/roles'

export const USER_API_ENDPOINTS = {
  LIST: '/users',
  DETAIL: (id: string) => `/users/${id}`,
  CREATE: '/users',
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
  ACTIVITY: (id: string) => `/users/${id}/activity`,
  STATISTICS: '/users/statistics',
} as const

export const USER_ROUTES = {
  LIST: '/users',
  CREATE: '/users/create',
  DETAIL: (id: string) => `/users/${id}`,
  EDIT: (id: string) => `/users/${id}/edit`,
  ACTIVITY: (id: string) => `/users/${id}/activity`,
} as const

export const USER_STATUS_LABELS: Record<
  import('@/features/users/types').UserStatus,
  string
> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

export const ASSIGNABLE_ROLES: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.CASHIER]

export const FUTURE_ROLES = [
  { id: 'manager', label: 'Manager' },
  { id: 'accountant', label: 'Accountant' },
] as const

export const ADMINISTRATOR_PERMISSIONS = [
  'Manage Users',
  'Manage Products',
  'Manage Inventory',
  'Manage Customers',
  'Manage Sales',
  'View Reports',
  'Manage Settings',
] as const

export const CASHIER_PERMISSIONS = [
  'Sales Processing',
  'Receipt Printing',
  'Customer Lookup',
  'Product Lookup',
  'Inventory Updates',
] as const

export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  [USER_ROLES.ADMIN]: ADMINISTRATOR_PERMISSIONS,
  [USER_ROLES.CASHIER]: CASHIER_PERMISSIONS,
}

export function getRoleLabel(roleId: UserRole): string {
  return ROLE_LABELS[roleId]
}
