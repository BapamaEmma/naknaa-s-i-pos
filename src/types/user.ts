import type { UserRole } from '@/constants/roles'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  branchId?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserSummary = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'avatarUrl'
>
