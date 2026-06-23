export const USER_ROLES = {
  ADMIN: 'administrator',
  CASHIER: 'cashier',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.CASHIER]: 'Cashier',
}

export const SHOP_STAFF_ROLES: UserRole[] = [USER_ROLES.CASHIER]

export const ALL_ROLES: UserRole[] = Object.values(USER_ROLES)

/** Maps legacy storekeeper sessions/data to cashier. */
export function normalizeUserRole(role: string): UserRole {
  if (role === 'storekeeper') {
    return USER_ROLES.CASHIER
  }

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.CASHIER) {
    return role
  }

  return USER_ROLES.CASHIER
}
