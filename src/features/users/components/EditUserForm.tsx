import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  editUserFormSchema,
  type EditUserFormInput,
  type EditUserFormOutput,
} from '@/features/users/schemas/user.schema'
import { ASSIGNABLE_ROLES, USER_STATUS_LABELS } from '@/features/users/constants'
import type { UserDetail } from '@/features/users/types'
import { useInventoryBranches } from '@/features/inventory/hooks/use-inventory'
import { ROLE_LABELS } from '@/constants/roles'
import { userService } from '@/services/users/userService'

interface EditUserFormProps {
  user: UserDetail
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: EditUserFormOutput) => Promise<void>
}

export function EditUserForm({
  user,
  isSubmitting = false,
  submitLabel = 'Save changes',
  onSubmit,
}: EditUserFormProps) {
  const { data: branches = [] } = useInventoryBranches()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditUserFormInput, unknown, EditUserFormOutput>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      branchId: user.branchId,
      status: user.status,
    },
  })

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      branchId: user.branchId,
      status: user.status,
    })
  }, [user, reset])

  const handleFormSubmit = handleSubmit(async (values) => {
    if (values.username.trim()) {
      const available = await userService.isUsernameAvailable(values.username, user.id)
      if (!available) {
        setError('username', { message: 'Username is already taken.' })
        return
      }
    }

    await onSubmit(values)
  })

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update user profile, role, branch, and account status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName ? (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName ? (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} />
            {errors.username ? (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" {...register('phoneNumber')} placeholder="+233 XX XXX XXXX" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleId">Role *</Label>
            <Select id="roleId" {...register('roleId')}>
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
            {errors.roleId ? (
              <p className="text-sm text-destructive">{errors.roleId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchId">Branch *</Label>
            <Select id="branchId" {...register('branchId')}>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            {errors.branchId ? (
              <p className="text-sm text-destructive">{errors.branchId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('status')}>
              {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {errors.status ? (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
