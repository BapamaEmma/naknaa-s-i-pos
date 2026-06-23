import type {
  CreateUserInput,
  ManagedUser,
  ResetPasswordInput,
  UpdateUserInput,
  UserActivity,
  UserActivityFilters,
  UserActivityResult,
  UserDetail,
  UserListFilters,
  UserListItem,
  UserListResult,
  UserStatistics,
} from '@/features/users/types'
import { ROLE_LABELS, normalizeUserRole } from '@/constants/roles'
import { ROLE_PERMISSIONS } from '@/features/users/constants'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'
import {
  BRANCHES_STORAGE_KEY,
  SEED_BRANCHES,
} from '@/services/inventory/mock-data'
import { delay, readStorage, writeStorage } from '@/services/products/storage'
import {
  SEED_EMPLOYEE_COUNTER,
  SEED_USER_ACTIVITY,
  SEED_USER_PASSWORDS,
  SEED_USERS,
  USER_ACTIVITY_STORAGE_KEY,
  USER_EMPLOYEE_COUNTER_KEY,
  USER_PASSWORDS_STORAGE_KEY,
  USERS_STORAGE_KEY,
} from '@/services/users/mock-data'

interface BranchOption {
  id: string
  name: string
}

function loadUsers(): ManagedUser[] {
  const users = readStorage<ManagedUser[]>(USERS_STORAGE_KEY, SEED_USERS)

  return users.map((user) => ({
    ...user,
    roleId: normalizeUserRole(user.roleId),
  }))
}

function saveUsers(users: ManagedUser[]): void {
  writeStorage(USERS_STORAGE_KEY, users)
}

function loadPasswords(): Record<string, string> {
  return readStorage(USER_PASSWORDS_STORAGE_KEY, SEED_USER_PASSWORDS)
}

function savePasswords(passwords: Record<string, string>): void {
  writeStorage(USER_PASSWORDS_STORAGE_KEY, passwords)
}

function loadActivities(): UserActivity[] {
  return readStorage(USER_ACTIVITY_STORAGE_KEY, SEED_USER_ACTIVITY)
}

function saveActivities(activities: UserActivity[]): void {
  writeStorage(USER_ACTIVITY_STORAGE_KEY, activities)
}

function loadEmployeeCounter(): number {
  return readStorage(USER_EMPLOYEE_COUNTER_KEY, SEED_EMPLOYEE_COUNTER)
}

function saveEmployeeCounter(value: number): void {
  writeStorage(USER_EMPLOYEE_COUNTER_KEY, value)
}

function loadBranches(): BranchOption[] {
  return readStorage(BRANCHES_STORAGE_KEY, SEED_BRANCHES)
}

function getBranchName(branchId: string): string {
  return loadBranches().find((branch) => branch.id === branchId)?.name ?? 'Unknown Branch'
}

function generateEmployeeId(): string {
  const next = loadEmployeeCounter() + 1
  saveEmployeeCounter(next)
  return `EMP-${String(next).padStart(6, '0')}`
}

function isUsernameTaken(username: string, excludeUserId?: string): boolean {
  const normalized = username.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return loadUsers().some(
    (user) =>
      user.username.toLowerCase() === normalized && (!excludeUserId || user.id !== excludeUserId),
  )
}

function isEmailTaken(email: string, excludeUserId?: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return loadUsers().some(
    (user) => user.email.toLowerCase() === normalized && (!excludeUserId || user.id !== excludeUserId),
  )
}

function enrichListItem(user: ManagedUser): UserListItem {
  return {
    id: user.id,
    employeeId: user.employeeId,
    fullName: `${user.firstName} ${user.lastName}`,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    roleId: user.roleId,
    roleName: ROLE_LABELS[user.roleId],
    branchId: user.branchId,
    branchName: getBranchName(user.branchId),
    status: user.status,
    lastLogin: user.lastLogin,
  }
}

function enrichDetail(user: ManagedUser): UserDetail {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    roleName: ROLE_LABELS[user.roleId],
    branchName: getBranchName(user.branchId),
    permissions: [...ROLE_PERMISSIONS[user.roleId]],
  }
}

function filterUsers(users: ManagedUser[], filters: UserListFilters): ManagedUser[] {
  const search = filters.search?.trim().toLowerCase()

  return users.filter((user) => {
    if (search) {
      const haystack = [
        user.firstName,
        user.lastName,
        user.username,
        user.email,
        user.employeeId,
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    if (filters.roleId && filters.roleId !== 'all' && user.roleId !== filters.roleId) {
      return false
    }

    if (filters.branchId && filters.branchId !== 'all' && user.branchId !== filters.branchId) {
      return false
    }

    if (filters.status && filters.status !== 'all' && user.status !== filters.status) {
      return false
    }

    return true
  })
}

function countOnlineUsers(users: ManagedUser[]): number {
  const threshold = Date.now() - 30 * 60 * 1000

  return users.filter((user) => {
    if (user.status !== 'active' || !user.lastLogin) {
      return false
    }

    return new Date(user.lastLogin).getTime() >= threshold
  }).length
}

function appendActivity(
  userId: string,
  activity: string,
  module: string,
  branchId: string,
): void {
  const activities = loadActivities()
  activities.unshift({
    id: crypto.randomUUID(),
    userId,
    activity,
    module,
    branchId,
    branchName: getBranchName(branchId),
    createdAt: new Date().toISOString(),
  })
  saveActivities(activities)
}

function assertCanDeleteUser(user: ManagedUser): void {
  if (user.roleId === 'administrator') {
    const activeAdmins = loadUsers().filter(
      (entry) => entry.roleId === 'administrator' && entry.status !== 'inactive',
    )

    if (activeAdmins.length <= 1) {
      throw new Error('Cannot delete the last administrator account.')
    }
  }
}

export const userService = {
  async getUsers(filters: UserListFilters = {}): Promise<UserListResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterUsers(loadUsers(), filters).sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    )
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit).map(enrichListItem),
      meta: { page, limit, total, totalPages },
    }
  },

  async getUserById(id: string): Promise<UserDetail> {
    await delay()

    const user = loadUsers().find((entry) => entry.id === id)
    if (!user) {
      throw new Error('User not found.')
    }

    return enrichDetail(user)
  },

  async getUserStatistics(): Promise<UserStatistics> {
    await delay()

    const users = loadUsers()

    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === 'active').length,
      suspendedUsers: users.filter((user) => user.status === 'suspended').length,
      onlineUsers: countOnlineUsers(users),
    }
  },

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    await delay(150)
    if (!username.trim()) {
      return true
    }

    return !isUsernameTaken(username, excludeUserId)
  },

  async createUser(input: CreateUserInput): Promise<UserDetail> {
    await delay()

    if (isUsernameTaken(input.username)) {
      throw new Error('Username is already taken.')
    }

    if (isEmailTaken(input.email)) {
      throw new Error('Email is already registered to another user.')
    }

    const branch = loadBranches().find((entry) => entry.id === input.branchId)
    if (!branch) {
      throw new Error('Invalid branch selected.')
    }

    const timestamp = new Date().toISOString()
    const user: ManagedUser = {
      id: crypto.randomUUID(),
      employeeId: generateEmployeeId(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      username: input.username.trim(),
      email: input.email.trim(),
      phoneNumber: input.phoneNumber.trim(),
      roleId: input.roleId,
      branchId: input.branchId,
      status: 'active',
      lastLogin: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const users = loadUsers()
    users.push(user)
    saveUsers(users)

    const passwords = loadPasswords()
    passwords[user.id] = input.password
    savePasswords(passwords)

    appendActivity(user.id, 'User Account Created', 'Users', user.branchId)

    return enrichDetail(user)
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<UserDetail> {
    await delay()

    const users = loadUsers()
    const index = users.findIndex((entry) => entry.id === id)

    if (index === -1) {
      throw new Error('User not found.')
    }

    if (isUsernameTaken(input.username, id)) {
      throw new Error('Username is already taken.')
    }

    if (isEmailTaken(input.email, id)) {
      throw new Error('Email is already registered to another user.')
    }

    const branch = loadBranches().find((entry) => entry.id === input.branchId)
    if (!branch) {
      throw new Error('Invalid branch selected.')
    }

    const current = users[index]

    if (
      current.roleId === 'administrator' &&
      input.roleId !== 'administrator' &&
      input.status !== 'inactive'
    ) {
      const otherAdmins = users.filter(
        (entry) =>
          entry.id !== id && entry.roleId === 'administrator' && entry.status !== 'inactive',
      )

      if (otherAdmins.length === 0) {
        throw new Error('At least one active administrator is required.')
      }
    }

    const updated: ManagedUser = {
      ...current,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      username: input.username.trim(),
      email: input.email.trim(),
      phoneNumber: input.phoneNumber.trim(),
      roleId: input.roleId,
      branchId: input.branchId,
      status: input.status,
      updatedAt: new Date().toISOString(),
    }

    users[index] = updated
    saveUsers(users)

    appendActivity(id, 'User Profile Updated', 'Users', updated.branchId)

    return enrichDetail(updated)
  },

  async suspendUser(id: string): Promise<UserDetail> {
    await delay()

    const users = loadUsers()
    const index = users.findIndex((entry) => entry.id === id)

    if (index === -1) {
      throw new Error('User not found.')
    }

    const current = users[index]

    if (current.roleId === 'administrator') {
      throw new Error('Administrator accounts cannot be suspended.')
    }

    const updated: ManagedUser = {
      ...current,
      status: 'suspended',
      updatedAt: new Date().toISOString(),
    }

    users[index] = updated
    saveUsers(users)

    appendActivity(id, 'User Suspended', 'Users', updated.branchId)

    return enrichDetail(updated)
  },

  async deleteUser(id: string): Promise<void> {
    await delay()

    const users = loadUsers()
    const user = users.find((entry) => entry.id === id)

    if (!user) {
      throw new Error('User not found.')
    }

    assertCanDeleteUser(user)

    saveUsers(users.filter((entry) => entry.id !== id))

    const passwords = loadPasswords()
    delete passwords[id]
    savePasswords(passwords)

    saveActivities(loadActivities().filter((entry) => entry.userId !== id))
  },

  async resetPassword(id: string, input: ResetPasswordInput): Promise<void> {
    await delay()

    const user = loadUsers().find((entry) => entry.id === id)
    if (!user) {
      throw new Error('User not found.')
    }

    const passwords = loadPasswords()
    passwords[id] = input.password
    savePasswords(passwords)

    appendActivity(id, 'Password Reset', 'Users', user.branchId)
  },

  async getUserActivity(
    userId: string,
    filters: UserActivityFilters = {},
  ): Promise<UserActivityResult> {
    await delay()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = loadActivities()
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return {
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    }
  },

  getDefaultBranchId(): string {
    return DEFAULT_BRANCH_ID
  },
}
