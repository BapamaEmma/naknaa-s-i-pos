import { z } from 'zod'
import { STOCK_OUT_REASONS } from '@/features/inventory/constants'

export const stockInSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productVariantId: z.string().min(1, 'Variant is required'),
  branchId: z.string().min(1, 'Branch is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unitCost: z.coerce.number().min(0, 'Unit cost must be 0 or more'),
  supplier: z.string().min(1, 'Supplier is required'),
  notes: z.string().optional(),
})

export const stockOutSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productVariantId: z.string().min(1, 'Variant is required'),
  branchId: z.string().min(1, 'Branch is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.enum(STOCK_OUT_REASONS),
  notes: z.string().optional(),
})

export const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productVariantId: z.string().min(1, 'Variant is required'),
  branchId: z.string().min(1, 'Branch is required'),
  newQuantity: z.coerce.number().int().min(0, 'New quantity must be 0 or more'),
  reason: z.string().min(1, 'Adjustment reason is required'),
})

export type StockInFormInput = z.input<typeof stockInSchema>
export type StockInFormOutput = z.output<typeof stockInSchema>
export type StockOutFormInput = z.input<typeof stockOutSchema>
export type StockOutFormOutput = z.output<typeof stockOutSchema>
export type AdjustmentFormInput = z.input<typeof adjustmentSchema>
export type AdjustmentFormOutput = z.output<typeof adjustmentSchema>
