import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/users/components/PageHeader'
import { EditUserForm } from '@/features/users/components/EditUserForm'
import { USER_ROUTES } from '@/features/users/constants'
import { useUpdateUser, useUser } from '@/features/users/hooks/use-users'
import type { EditUserFormOutput } from '@/features/users/schemas/user.schema'
import { getErrorMessage } from '@/lib/utils'

export function EditUserPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, refreshUser } = useAuth()
  const { data: user, isLoading, isError } = useUser(id)
  const updateUser = useUpdateUser()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: EditUserFormOutput) => {
    if (!id) return

    setErrorMessage(null)

    try {
      await updateUser.mutateAsync({
        id,
        input: {
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          phoneNumber: values.phoneNumber,
          roleId: values.roleId,
          shopName: values.shopName,
          status: values.status,
        },
      })

      if (currentUser?.id === id) {
        await refreshUser()
      }

      navigate(USER_ROUTES.DETAIL(id))
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to update user.'))
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" layout="form" />
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Edit ${user.fullName}`}
        description={`${user.employeeId} · ${user.roleName}`}
        backTo={USER_ROUTES.DETAIL(id)}
        backLabel="Back to user details"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <EditUserForm user={user} isSubmitting={updateUser.isPending} onSubmit={handleSubmit} />
    </div>
  )
}
