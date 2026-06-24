import { z } from 'zod'

export const serviceFormSchema = z.object({
  serviceName: z.string().trim().min(1, 'Service name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().trim(),
  standardPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  status: z.enum(['active', 'inactive']),
})

export const serviceCategoryFormSchema = z.object({
  categoryName: z.string().trim().min(1, 'Category name is required'),
  description: z.string().trim(),
  status: z.enum(['active', 'inactive']),
})

export const serviceJobFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceId: z.string().min(1, 'Service is required'),
  technicianId: z.string().min(1, 'Technician is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  expectedCompletionDate: z.string().min(1, 'Expected completion date is required'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  notes: z.string().trim(),
})

export const serviceJobEditFormSchema = serviceJobFormSchema.extend({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  completionDate: z.string().trim(),
})

export type ServiceFormInput = z.input<typeof serviceFormSchema>
export type ServiceFormOutput = z.output<typeof serviceFormSchema>
export type ServiceCategoryFormInput = z.input<typeof serviceCategoryFormSchema>
export type ServiceCategoryFormOutput = z.output<typeof serviceCategoryFormSchema>
export type ServiceJobFormInput = z.input<typeof serviceJobFormSchema>
export type ServiceJobFormOutput = z.output<typeof serviceJobFormSchema>
export type ServiceJobEditFormInput = z.input<typeof serviceJobEditFormSchema>
export type ServiceJobEditFormOutput = z.output<typeof serviceJobEditFormSchema>
