import type {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
  UserActivityFilters,
  UserActivityResult,
  UserDetail,
  UserListFilters,
  UserListResult,
  UserStatistics,
} from '@/features/users/types'
import type { UserRole } from '@/constants/roles'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiDelete, apiGet, apiPost, apiPut, toPagedMeta } from '@/services/api/http'
import {
  BACKEND_DEFAULT_BRANCH_ID,
  BACKEND_ROLE_IDS,
  buildQueryParams,
  mapUserActivity,
  mapUserDetail,
  mapUserListItem,
} from '@/services/api/mappers'
import type { PagedResult } from '@/services/api/types'

function toUserListQuery(filters: UserListFilters) {
  const params: Record<string, string | number | boolean | undefined> = {
    search: filters.search,
    branchId: filters.branchId,
    page: filters.page ?? 1,
    pageSize: filters.limit ?? 10,
  }

  if (filters.roleId && filters.roleId !== 'all') {
    params.roleId = BACKEND_ROLE_IDS[filters.roleId as UserRole] ?? filters.roleId
  }

  if (filters.status === 'active') params.isActive = true
  if (filters.status === 'inactive' || filters.status === 'suspended') params.isActive = false

  return buildQueryParams(params)
}

function toCreateUserPayload(input: CreateUserInput) {
  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    username: input.username.trim(),
    email: input.email.trim(),
    phoneNumber: input.phoneNumber.trim(),
    roleId: BACKEND_ROLE_IDS[input.roleId],
    branchId: input.branchId,
    password: input.password,
  }
}

function toUpdateUserPayload(input: UpdateUserInput) {
  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    username: input.username.trim(),
    email: input.email.trim(),
    phoneNumber: input.phoneNumber.trim(),
    roleId: BACKEND_ROLE_IDS[input.roleId],
    branchId: input.branchId,
    isActive: input.status === 'active',
  }
}

export const userService = {
  async getUsers(filters: UserListFilters = {}): Promise<UserListResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.users, {
      params: toUserListQuery(filters),
    })
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapUserListItem(item)),
      meta: paged.meta,
    }
  },

  async getUserById(id: string): Promise<UserDetail> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.user(id))
    return mapUserDetail(dto)
  },

  async authenticate(_email: string, _password: string): Promise<UserDetail> {
    throw new Error('Use authService.login() for authentication.')
  },

  async getUserStatistics(): Promise<UserStatistics> {
    const dto = await apiGet<Record<string, unknown>>(API_ENDPOINTS.usersStatistics)
    return {
      totalUsers: Number(dto.totalUsers ?? 0),
      activeUsers: Number(dto.activeUsers ?? 0),
      suspendedUsers: Number(dto.inactiveUsers ?? 0),
      onlineUsers: 0,
    }
  },

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    if (!username.trim()) return true

    const result = await apiGet<PagedResult<Record<string, unknown>>>(API_ENDPOINTS.users, {
      params: buildQueryParams({ search: username.trim(), page: 1, pageSize: 20 }),
    })

    const normalized = username.trim().toLowerCase()
    return !result.items.some((item) => {
      const itemUsername = String(item.username ?? '').toLowerCase()
      const itemId = String(item.id)
      return itemUsername === normalized && (!excludeUserId || itemId !== excludeUserId)
    })
  },

  async createUser(input: CreateUserInput): Promise<UserDetail> {
    const dto = await apiPost<Record<string, unknown>>(
      API_ENDPOINTS.users,
      toCreateUserPayload(input),
    )
    return mapUserDetail(dto)
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<UserDetail> {
    const dto = await apiPut<Record<string, unknown>>(
      API_ENDPOINTS.user(id),
      toUpdateUserPayload(input),
    )
    return mapUserDetail(dto)
  },

  async suspendUser(id: string): Promise<UserDetail> {
    const current = await this.getUserById(id)
    return this.updateUser(id, {
      firstName: current.firstName,
      lastName: current.lastName,
      username: current.username,
      email: current.email,
      phoneNumber: current.phoneNumber,
      roleId: current.roleId,
      branchId: current.branchId,
      status: 'inactive',
    })
  },

  async deleteUser(id: string): Promise<void> {
    await apiDelete(API_ENDPOINTS.user(id))
  },

  async resetPassword(id: string, input: ResetPasswordInput): Promise<void> {
    await apiPost(API_ENDPOINTS.userResetPassword(id), { password: input.password })
  },

  async getUserActivity(
    userId: string,
    filters: UserActivityFilters = {},
  ): Promise<UserActivityResult> {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(
      API_ENDPOINTS.userActivity(userId),
      {
        params: buildQueryParams({
          page: filters.page ?? 1,
          pageSize: filters.limit ?? 10,
        }),
      },
    )
    const paged = toPagedMeta(result, filters.limit ?? 10)
    return {
      data: paged.data.map((item) => mapUserActivity(item)),
      meta: paged.meta,
    }
  },

  getDefaultBranchId(): string {
    return BACKEND_DEFAULT_BRANCH_ID
  },
}
