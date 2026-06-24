import type { ManagedUser, UserActivity } from '@/features/users/types'
import { USER_ROLES } from '@/constants/roles'
import { DEFAULT_BRANCH_ID } from '@/features/inventory/constants'

export const USERS_STORAGE_KEY = 'naknaa_users_v4'
export const USER_PASSWORDS_STORAGE_KEY = 'naknaa_user_passwords_v1'
export const USER_ACTIVITY_STORAGE_KEY = 'naknaa_user_activity_v1'
export const USER_EMPLOYEE_COUNTER_KEY = 'naknaa_user_employee_counter_v1'

export const SEED_EMPLOYEE_COUNTER = 3

const now = new Date()
const recentLogin = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
const olderLogin = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()

export const SEED_USERS: ManagedUser[] = [
  {
    id: 'user-admin-001',
    employeeId: 'EMP-000001',
    firstName: 'NakNaa',
    lastName: 'Admin',
    username: 'naknaa.admin',
    email: 'admin@naknaa.com',
    phoneNumber: '+233 24 111 0001',
    roleId: USER_ROLES.ADMIN,
    branchId: DEFAULT_BRANCH_ID,
    status: 'active',
    lastLogin: recentLogin,
    createdAt: '2025-11-01T08:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'user-store-accra-001',
    employeeId: 'EMP-000002',
    firstName: 'Ama',
    lastName: 'Mensah',
    username: 'cashier.accra',
    email: 'cashier.accra@naknaa.com',
    phoneNumber: '+233 24 222 0002',
    roleId: USER_ROLES.CASHIER,
    branchId: 'branch-accra',
    status: 'active',
    lastLogin: recentLogin,
    createdAt: '2025-12-10T08:00:00.000Z',
    updatedAt: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'user-store-kumasi-001',
    employeeId: 'EMP-000003',
    firstName: 'Kwame',
    lastName: 'Boateng',
    username: 'cashier.kumasi',
    email: 'cashier.kumasi@naknaa.com',
    phoneNumber: '+233 24 333 0003',
    roleId: USER_ROLES.CASHIER,
    branchId: 'branch-kumasi',
    status: 'active',
    lastLogin: olderLogin,
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 'user-store-inactive-001',
    employeeId: 'EMP-000004',
    firstName: 'Esi',
    lastName: 'Owusu',
    username: 'esi.owusu',
    email: 'esi.owusu@naknaa.com',
    phoneNumber: '+233 24 444 0004',
    roleId: USER_ROLES.CASHIER,
    branchId: DEFAULT_BRANCH_ID,
    status: 'inactive',
    lastLogin: null,
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-02-01T11:00:00.000Z',
  },
  {
    id: 'user-store-suspended-001',
    employeeId: 'EMP-000005',
    firstName: 'Kojo',
    lastName: 'Asante',
    username: 'kojo.asante',
    email: 'kojo.asante@naknaa.com',
    phoneNumber: '+233 24 555 0005',
    roleId: USER_ROLES.CASHIER,
    branchId: 'branch-accra',
    status: 'suspended',
    lastLogin: olderLogin,
    createdAt: '2025-10-15T08:00:00.000Z',
    updatedAt: '2026-02-28T16:00:00.000Z',
  },
]

export const SEED_USER_PASSWORDS: Record<string, string> = {
  'user-admin-001': 'password',
  'user-store-accra-001': 'password',
  'user-store-kumasi-001': 'password',
  'user-store-inactive-001': 'password',
  'user-store-suspended-001': 'password',
}

export const SEED_USER_ACTIVITY: UserActivity[] = [
  {
    id: 'activity-001',
    userId: 'user-admin-001',
    activity: 'User Login',
    module: 'Authentication',
    branchId: DEFAULT_BRANCH_ID,
    branchName: 'NakNaa Main Store',
    createdAt: recentLogin,
  },
  {
    id: 'activity-002',
    userId: 'user-admin-001',
    activity: 'Product Created',
    module: 'Products',
    branchId: DEFAULT_BRANCH_ID,
    branchName: 'NakNaa Main Store',
    createdAt: '2026-03-10T10:15:00.000Z',
  },
  {
    id: 'activity-003',
    userId: 'user-admin-001',
    activity: 'Customer Added',
    module: 'Customers',
    branchId: DEFAULT_BRANCH_ID,
    branchName: 'NakNaa Main Store',
    createdAt: '2026-03-10T11:00:00.000Z',
  },
  {
    id: 'activity-004',
    userId: 'user-store-accra-001',
    activity: 'User Login',
    module: 'Authentication',
    branchId: 'branch-accra',
    branchName: 'NakNaa Anest',
    createdAt: recentLogin,
  },
  {
    id: 'activity-005',
    userId: 'user-store-accra-001',
    activity: 'Sale Completed',
    module: 'Sales',
    branchId: 'branch-accra',
    branchName: 'NakNaa Anest',
    createdAt: '2026-03-10T09:45:00.000Z',
  },
  {
    id: 'activity-006',
    userId: 'user-store-accra-001',
    activity: 'Inventory Updated',
    module: 'Inventory',
    branchId: 'branch-accra',
    branchName: 'NakNaa Anest',
    createdAt: '2026-03-09T16:20:00.000Z',
  },
  {
    id: 'activity-007',
    userId: 'user-store-kumasi-001',
    activity: 'User Login',
    module: 'Authentication',
    branchId: 'branch-kumasi',
    branchName: 'Back Store',
    createdAt: olderLogin,
  },
  {
    id: 'activity-008',
    userId: 'user-store-kumasi-001',
    activity: 'Sale Completed',
    module: 'Sales',
    branchId: 'branch-kumasi',
    branchName: 'Back Store',
    createdAt: '2026-03-08T14:10:00.000Z',
  },
  {
    id: 'activity-009',
    userId: 'user-store-kumasi-001',
    activity: 'Inventory Updated',
    module: 'Inventory',
    branchId: 'branch-kumasi',
    branchName: 'Back Store',
    createdAt: '2026-03-07T12:00:00.000Z',
  },
]
