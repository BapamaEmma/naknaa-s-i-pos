import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Activity, KeyRound, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/users/components/PageHeader'
import { ResetPasswordDialog } from '@/features/users/components/ResetPasswordDialog'
import { UserPermissionsCard } from '@/features/users/components/UserPermissionsCard'
import { UserProfileCard } from '@/features/users/components/UserProfileCard'
import { USER_ROUTES } from '@/features/users/constants'
import { useUser } from '@/features/users/hooks/use-users'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { USER_ROLES } from '@/constants/roles'
import type { UserListItem } from '@/features/users/types'

export function UserDetailsPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const { data: user, isLoading, isError } = useUser(id)
  const [resetOpen, setResetOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">User not found.</p>
        <Button asChild variant="outline">
          <Link to={USER_ROUTES.LIST}>Back to users</Link>
        </Button>
      </div>
    )
  }

  const listItem: UserListItem = {
    id: user.id,
    employeeId: user.employeeId,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    roleId: user.roleId,
    roleName: user.roleName,
    branchId: user.branchId,
    branchName: user.branchName,
    status: user.status,
    lastLogin: user.lastLogin,
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={user.fullName}
        description={`${user.employeeId}${user.username ? ` · ${user.username}` : ''} · ${user.roleName}`}
        backTo={USER_ROUTES.LIST}
        backLabel="Back to users"
        action={
          <>
            <Button variant="outline" asChild>
              <Link to={USER_ROUTES.ACTIVITY(id)}>
                <Activity className="h-4 w-4" />
                Activity
              </Link>
            </Button>
            {canManage ? (
              <>
                <Button variant="outline" onClick={() => setResetOpen(true)}>
                  <KeyRound className="h-4 w-4" />
                  Reset Password
                </Button>
                <Button asChild>
                  <Link to={USER_ROUTES.EDIT(id)}>
                    <Pencil className="h-4 w-4" />
                    Edit User
                  </Link>
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <UserProfileCard user={user} />
        <UserPermissionsCard user={user} />
      </div>

      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} user={listItem} />
    </div>
  )
}
