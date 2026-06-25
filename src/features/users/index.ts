export { UserListPage } from './pages/UserListPage'
export { CreateUserPage } from './pages/CreateUserPage'
export { EditUserPage } from './pages/EditUserPage'
export { UserDetailsPage } from './pages/UserDetailsPage'
export { UserActivityPage } from './pages/UserActivityPage'

export {
  useUsers,
  useUser,
  useUserStatistics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSuspendUser,
  useResetPassword,
  useUserActivity,
} from './hooks/use-users'

export { UserTable } from './components/UserTable'
export { CreateUserForm } from './components/CreateUserForm'
export { EditUserForm } from './components/EditUserForm'
export { UserFilters } from './components/UserFilters'
export { UserProfileCard } from './components/UserProfileCard'
export { UserStatsCards } from './components/UserStatsCards'
export { UserActivityTable } from './components/UserActivityTable'
export { ResetPasswordDialog } from './components/ResetPasswordDialog'
export { UserPermissionsCard } from './components/UserPermissionsCard'

export { USER_ROUTES, USER_API_ENDPOINTS } from './constants'
export type {
  ManagedUser,
  UserDetail,
  UserListFilters,
  UserListItem,
  UserListResult,
  UserStatistics,
  UserStatus,
  UserActivity,
  CreateUserInput,
  UpdateUserInput,
} from './types'
