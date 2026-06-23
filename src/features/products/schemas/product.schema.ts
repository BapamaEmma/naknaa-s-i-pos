import { z } from 'zod'

export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string(),
  sku: z.string(),
  description: z.string(),
  warrantyMonths: z.coerce.number().int().min(0, 'Warranty must be 0 or more'),
  imageUrl: z.string(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
})

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormOutput = z.output<typeof productFormSchema>

export const productPricingFieldsSchema = z.object({
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or more'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be 0 or more'),
  initialStock: z.coerce.number().int().min(0, 'Initial stock must be 0 or more'),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock must be 0 or more'),
})

export const productWithPricingFormSchema = productFormSchema.merge(productPricingFieldsSchema)

export type ProductWithPricingFormInput = z.input<typeof productWithPricingFormSchema>
export type ProductWithPricingFormOutput = z.output<typeof productWithPricingFormSchema>

export const variantFormSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  variantType: z.string().min(1, 'Variant type is required'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or more'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be 0 or more'),
  currentStock: z.coerce.number().int().min(0, 'Current stock must be 0 or more'),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock must be 0 or more'),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
})

export type VariantFormInput = z.input<typeof variantFormSchema>
export type VariantFormOutput = z.output<typeof variantFormSchema>
