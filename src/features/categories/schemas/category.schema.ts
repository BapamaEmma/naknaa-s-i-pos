import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormOutput = z.output<typeof categoryFormSchema>
