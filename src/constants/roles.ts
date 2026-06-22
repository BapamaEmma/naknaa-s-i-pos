export const USER_ROLES = {
  ADMIN: 'administrator',
  STOREKEEPER: 'storekeeper',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.STOREKEEPER]: 'Storekeeper',
}

export const ALL_ROLES: UserRole[] = Object.values(USER_ROLES)
