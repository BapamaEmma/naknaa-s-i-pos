import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createUserFormSchema,
  type CreateUserFormInput,
  type CreateUserFormOutput,
} from '@/features/users/schemas/user.schema'
import { ASSIGNABLE_ROLES } from '@/features/users/constants'
import { ROLE_LABELS } from '@/constants/roles'
import { userService } from '@/services/users/userService'

interface CreateUserFormProps {
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: CreateUserFormOutput) => Promise<void>
}

export function CreateUserForm({
  isSubmitting = false,
  submitLabel = 'Create user',
  onSubmit,
}: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateUserFormInput, unknown, CreateUserFormOutput>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phoneNumber: '',
      roleId: 'cashier',
      shopName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleFormSubmit = handleSubmit(async (values) => {
    if (values.username.trim()) {
      const available = await userService.isUsernameAvailable(values.username)
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
            Create a new system user with role and shop assignment.
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shopName">Shop Name *</Label>
            <Input
              id="shopName"
              {...register('shopName')}
              placeholder="e.g. NakNaa Ring Road Shop"
            />
            {errors.shopName ? (
              <p className="text-sm text-destructive">{errors.shopName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
