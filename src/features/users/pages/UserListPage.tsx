import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/users/components/PageHeader'
import { ResetPasswordDialog } from '@/features/users/components/ResetPasswordDialog'
import { UserDeleteDialog } from '@/features/users/components/UserDeleteDialog'
import { UserFilters } from '@/features/users/components/UserFilters'
import { UserStatsCards } from '@/features/users/components/UserStatsCards'
import { UserTable } from '@/features/users/components/UserTable'
import { USER_ROUTES } from '@/features/users/constants'
import {
  useDeleteUser,
  useSuspendUser,
  useUserStatistics,
  useUsers,
} from '@/features/users/hooks/use-users'
import type { UserListFilters, UserListItem } from '@/features/users/types'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { USER_ROLES } from '@/constants/roles'

export function UserListPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [filters, setFilters] = useState<UserListFilters>({
    page: 1,
    limit: 10,
    roleId: 'all',
    branchId: 'all',
    status: 'all',
  })
  const [resetOpen, setResetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)

  const { data: statistics, isLoading: statsLoading } = useUserStatistics()
  const { data, isLoading } = useUsers(filters)
  const suspendUser = useSuspendUser()
  const deleteUser = useDeleteUser()

  const openResetDialog = (user: UserListItem) => {
    setSelectedUser(user)
    setResetOpen(true)
  }

  const openDeleteDialog = (user: UserListItem) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  const handleSuspend = async (user: UserListItem) => {
    try {
      await suspendUser.mutateAsync(user.id)
    } catch {
      // Optional toast in future
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Users"
        description="Manage system users, roles, branches, and account access."
        action={
          canManage ? (
            <Button asChild>
              <Link to={USER_ROUTES.CREATE}>
                <Plus className="h-4 w-4" />
                Add User
              </Link>
            </Button>
          ) : null
        }
      />

      <UserStatsCards statistics={statistics} isLoading={statsLoading} />
      <UserFilters filters={filters} onChange={setFilters} />

      {suspendUser.isError ? (
        <p className="text-sm text-destructive">
          {suspendUser.error instanceof Error
            ? suspendUser.error.message
            : 'Unable to suspend user.'}
        </p>
      ) : null}

      {deleteUser.isError ? (
        <p className="text-sm text-destructive">
          {deleteUser.error instanceof Error ? deleteUser.error.message : 'Unable to delete user.'}
        </p>
      ) : null}

      <UserTable
        data={data}
        isLoading={isLoading}
        canManage={canManage}
        onResetPassword={openResetDialog}
        onSuspend={handleSuspend}
        onDelete={openDeleteDialog}
      />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} user={selectedUser} />
      <UserDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} user={selectedUser} />
    </div>
  )
}
