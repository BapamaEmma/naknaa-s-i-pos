import { z } from 'zod'

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().trim(),
  productVariantId: z.string().min(1, 'Variant is required'),
  variantName: z.string().trim(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  section: z.string().trim().min(1, 'Section is required'),
  rack: z.string().trim().min(1, 'Rack is required'),
  bin: z.string().trim().min(1, 'Bin is required'),
})

export const purchaseFormSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  invoiceNumber: z.string().trim(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']),
  purchaseStatus: z.enum(['draft', 'ordered', 'partially_received', 'received', 'cancelled']),
  notes: z.string().trim(),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one product'),
})

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().trim(),
  productVariantId: z.string().min(1, 'Variant is required'),
  variantName: z.string().trim(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
})

export const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  notes: z.string().trim(),
  items: z.array(purchaseOrderItemSchema).min(1, 'Add at least one product'),
})

export const receiveItemSchema = z.object({
  purchaseItemId: z.string().min(1),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
})

export const receivePurchaseSchema = z.object({
  purchaseId: z.string().min(1, 'Purchase is required'),
  items: z.array(receiveItemSchema).min(1),
})

export type PurchaseFormInput = z.input<typeof purchaseFormSchema>
export type PurchaseFormOutput = z.output<typeof purchaseFormSchema>
export type PurchaseOrderFormInput = z.input<typeof purchaseOrderFormSchema>
export type PurchaseOrderFormOutput = z.output<typeof purchaseOrderFormSchema>
export type ReceivePurchaseFormInput = z.input<typeof receivePurchaseSchema>
export type ReceivePurchaseFormOutput = z.output<typeof receivePurchaseSchema>
