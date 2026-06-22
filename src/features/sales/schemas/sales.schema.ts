import { z } from 'zod'

export const customerSchema = z.object({
  mode: z.enum(['walk_in', 'existing', 'new']),
  customerId: z.string().optional(),
  name: z.string().trim().min(1, 'Customer name is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
})

export const checkoutSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  paymentMethod: z.enum(['cash', 'mobile_money']),
  discount: z.coerce.number().min(0, 'Discount cannot be negative'),
  customer: customerSchema,
})

export type CheckoutFormInput = z.input<typeof checkoutSchema>
export type CheckoutFormOutput = z.output<typeof checkoutSchema>
