import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/features/users/components/PageHeader'
import { CreateUserForm } from '@/features/users/components/CreateUserForm'
import { USER_ROUTES } from '@/features/users/constants'
import { useCreateUser } from '@/features/users/hooks/use-users'
import type { CreateUserFormOutput } from '@/features/users/schemas/user.schema'
import { getErrorMessage } from '@/lib/utils'

export function CreateUserPage() {
  const navigate = useNavigate()
  const createUser = useCreateUser()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: CreateUserFormOutput) => {
    setErrorMessage(null)

    try {
      const user = await createUser.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        roleId: values.roleId,
        shopName: values.shopName,
        password: values.password,
      })

      navigate(USER_ROUTES.DETAIL(user.id))
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to create user.'))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create User"
        description="Add a new user with role-based access and branch assignment."
        backTo={USER_ROUTES.LIST}
        backLabel="Back to users"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <CreateUserForm isSubmitting={createUser.isPending} onSubmit={handleSubmit} />
    </div>
  )
}
