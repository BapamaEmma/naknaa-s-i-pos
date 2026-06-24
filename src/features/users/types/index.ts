import type { UserRole } from '@/constants/roles'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface ManagedUser {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  roleId: UserRole
  branchId: string
  status: UserStatus
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface UserListItem {
  id: string
  employeeId: string
  fullName: string
  username: string
  email: string
  phoneNumber: string
  roleId: UserRole
  roleName: string
  branchId: string
  branchName: string
  status: UserStatus
  lastLogin: string | null
}

export interface UserDetail extends ManagedUser {
  fullName: string
  roleName: string
  branchName: string
  permissions: string[]
}

export interface UserListFilters {
  search?: string
  roleId?: UserRole | 'all'
  branchId?: string | 'all'
  status?: UserStatus | 'all'
  page?: number
  limit?: number
}

export interface UserListResult {
  data: UserListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  onlineUsers: number
}

export interface CreateUserInput {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  roleId: UserRole
  branchId: string
  password: string
}

export interface UpdateUserInput {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  roleId: UserRole
  branchId: string
  status: UserStatus
}

export interface ResetPasswordInput {
  password: string
}

export interface UserActivity {
  id: string
  userId: string
  activity: string
  module: string
  branchId: string
  branchName: string
  createdAt: string
}

export interface UserActivityFilters {
  page?: number
  limit?: number
}

export interface UserActivityResult {
  data: UserActivity[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
