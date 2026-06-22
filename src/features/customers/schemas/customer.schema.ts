import { z } from 'zod'

export const customerFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  email: z.string().email('Enter a valid email address').or(z.literal('')),
  address: z.string(),
  city: z.string(),
  notes: z.string(),
  status: z.enum(['active', 'inactive']),
})

export type CustomerFormInput = z.input<typeof customerFormSchema>
export type CustomerFormOutput = z.output<typeof customerFormSchema>
