import { z } from 'zod'
import { USER_ROLES } from '@/constants/roles'

const optionalUsername = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Username can only contain letters, numbers, dots, dashes, and underscores',
    ),
])

const baseUserFields = {
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  username: optionalUsername,
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
  phoneNumber: z.string().trim(),
  roleId: z.enum([USER_ROLES.ADMIN, USER_ROLES.CASHIER], {
    message: 'Role is required',
  }),
  branchId: z.string().min(1, 'Branch is required'),
}

export const createUserFormSchema = z
  .object({
    ...baseUserFields,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const editUserFormSchema = z.object({
  ...baseUserFields,
  status: z.enum(['active', 'inactive', 'suspended']),
})

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type CreateUserFormInput = z.input<typeof createUserFormSchema>
export type CreateUserFormOutput = z.output<typeof createUserFormSchema>
export type EditUserFormInput = z.input<typeof editUserFormSchema>
export type EditUserFormOutput = z.output<typeof editUserFormSchema>
export type ResetPasswordFormInput = z.input<typeof resetPasswordFormSchema>
export type ResetPasswordFormOutput = z.output<typeof resetPasswordFormSchema>
