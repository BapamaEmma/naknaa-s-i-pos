import { z } from 'zod'

export const supplierSupplyItemSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  color: z.string().trim(),
})

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, 'Supplier name is required'),
  storeName: z.string().trim(),
  suppliedToPerson: z.string().trim(),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
  phoneNumber: z.string().trim(),
  address: z.string().trim(),
  city: z.string().trim(),
  notes: z.string().trim(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
})

export const supplierCreateFormSchema = supplierFormSchema.extend({
  items: z.array(supplierSupplyItemSchema).min(1, 'Add at least one item supplied by this vendor'),
})

export const supplierProductFormSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  productId: z.string().min(1, 'Product is required'),
  productVariantId: z.string().min(1, 'Product variant is required'),
  quantitySupplied: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  dateSupplied: z.string().min(1, 'Date supplied is required'),
  notes: z.string().trim(),
})

export type SupplierFormInput = z.input<typeof supplierFormSchema>
export type SupplierFormOutput = z.output<typeof supplierFormSchema>
export type SupplierCreateFormInput = z.input<typeof supplierCreateFormSchema>
export type SupplierCreateFormOutput = z.output<typeof supplierCreateFormSchema>
export type SupplierSupplyItemFormOutput = z.output<typeof supplierSupplyItemSchema>
export type SupplierProductFormInput = z.input<typeof supplierProductFormSchema>
export type SupplierProductFormOutput = z.output<typeof supplierProductFormSchema>
