import { z } from 'zod'

export const warehouseFormSchema = z.object({
  warehouseName: z.string().trim().min(1, 'Warehouse name is required'),
  description: z.string().trim(),
  address: z.string().trim(),
  manager: z.string().trim(),
  status: z.enum(['active', 'inactive']),
})

export const locationFormSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  section: z.string().trim().min(1, 'Section is required'),
  rack: z.string().trim().min(1, 'Rack is required'),
  bin: z.string().trim().min(1, 'Bin is required'),
  description: z.string().trim(),
})

export const transferFormSchema = z
  .object({
    fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
    toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
    productId: z.string().min(1, 'Product is required'),
    productVariantId: z.string().min(1, 'Variant is required'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    reason: z.string().trim().min(1, 'Reason is required'),
    notes: z.string().trim(),
  })
  .refine((values) => values.fromWarehouseId !== values.toWarehouseId, {
    message: 'Source and destination warehouses must be different',
    path: ['toWarehouseId'],
  })

export type WarehouseFormInput = z.input<typeof warehouseFormSchema>
export type WarehouseFormOutput = z.output<typeof warehouseFormSchema>
export type LocationFormInput = z.input<typeof locationFormSchema>
export type LocationFormOutput = z.output<typeof locationFormSchema>
export type TransferFormInput = z.input<typeof transferFormSchema>
export type TransferFormOutput = z.output<typeof transferFormSchema>

export const warehouseStockEntrySchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  productName: z.string().trim().min(1, 'Item name is required'),
  brand: z.string().trim().min(1, 'Brand is required'),
  color: z.string().trim(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  notes: z.string().trim(),
})

export type WarehouseStockEntryFormInput = z.input<typeof warehouseStockEntrySchema>
export type WarehouseStockEntryFormOutput = z.output<typeof warehouseStockEntrySchema>
