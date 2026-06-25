import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  PAYMENT_STATUS_LABELS,
  PURCHASE_STATUS_LABELS,
} from '@/features/purchases/constants'
import {
  purchaseFormSchema,
  type PurchaseFormInput,
  type PurchaseFormOutput,
} from '@/features/purchases/schemas/purchase.schema'
import type { PurchaseDetail } from '@/features/purchases/types'
import { useInventoryProducts, useInventoryVariants } from '@/features/inventory/hooks/use-inventory'
import { useSupplierOptions } from '@/features/suppliers/hooks/use-suppliers'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'
import { formatCurrency } from '@/lib/format'

interface PurchaseFormProps {
  purchase?: PurchaseDetail
  isLoading?: boolean
  isSubmitting?: boolean
  onSubmit: (values: PurchaseFormOutput) => Promise<void>
}

const emptyItem = {
  productId: '',
  productName: '',
  productVariantId: '',
  variantName: '',
  quantity: 1,
  costPrice: 0,
  section: 'Speakers',
  rack: 'A-01',
  bin: 'B-05',
}

const defaultValues: PurchaseFormInput = {
  supplierId: '',
  warehouseId: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  invoiceNumber: '',
  paymentStatus: 'unpaid',
  purchaseStatus: 'ordered',
  notes: '',
  items: [emptyItem],
}

function PurchaseItemRow({
  index,
  register,
  watch,
  setValue,
  remove,
  canRemove,
}: {
  index: number
  register: ReturnType<typeof useForm<PurchaseFormInput>>['register']
  watch: ReturnType<typeof useForm<PurchaseFormInput>>['watch']
  setValue: ReturnType<typeof useForm<PurchaseFormInput>>['setValue']
  remove: (index: number) => void
  canRemove: boolean
}) {
  const productId = watch(`items.${index}.productId`)
  const quantity = watch(`items.${index}.quantity`) || 0
  const costPrice = watch(`items.${index}.costPrice`) || 0
  const { data: products = [] } = useInventoryProducts()
  const { data: variants = [] } = useInventoryVariants(productId || undefined)

  return (
    <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2 xl:col-span-2">
        <Label>Product *</Label>
        <Select
          value={productId}
          onChange={(event) => {
            const selected = products.find((entry) => entry.id === event.target.value)
            setValue(`items.${index}.productId`, event.target.value)
            setValue(`items.${index}.productName`, selected?.name ?? '')
            setValue(`items.${index}.productVariantId`, '')
            setValue(`items.${index}.variantName`, '')
          }}
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Variant *</Label>
        <Select
          value={watch(`items.${index}.productVariantId`)}
          onChange={(event) => {
            const selected = variants.find((entry) => entry.id === event.target.value)
            setValue(`items.${index}.productVariantId`, event.target.value)
            setValue(`items.${index}.variantName`, selected?.name ?? '')
            if (selected?.unitCost) {
              setValue(`items.${index}.costPrice`, selected.unitCost)
            }
          }}
        >
          <option value="">Select variant</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Quantity *</Label>
        <Input type="number" min={1} {...register(`items.${index}.quantity`)} />
      </div>
      <div className="space-y-2">
        <Label>Cost Price *</Label>
        <Input type="number" min={0} step="0.01" {...register(`items.${index}.costPrice`)} />
      </div>
      <div className="space-y-2">
        <Label>Section *</Label>
        <Input {...register(`items.${index}.section`)} />
      </div>
      <div className="space-y-2">
        <Label>Rack *</Label>
        <Input {...register(`items.${index}.rack`)} />
      </div>
      <div className="space-y-2">
        <Label>Bin *</Label>
        <Input {...register(`items.${index}.bin`)} />
      </div>
      <div className="flex items-end justify-between gap-3 xl:col-span-2">
        <p className="text-sm text-muted-foreground">
          Line total: {formatCurrency(Number(quantity) * Number(costPrice))}
        </p>
        {canRemove ? (
          <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function PurchaseForm({ purchase, isLoading, isSubmitting, onSubmit }: PurchaseFormProps) {
  const { data: suppliers = [] } = useSupplierOptions()
  const { data: warehousesData } = useWarehouses({ page: 1, limit: 100, status: 'active' })

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormInput, unknown, PurchaseFormOutput>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items') ?? []

  useEffect(() => {
    if (purchase) {
      reset({
        supplierId: purchase.supplierId,
        warehouseId: purchase.warehouseId,
        purchaseDate: purchase.purchaseDate,
        invoiceNumber: purchase.invoiceNumber,
        paymentStatus: purchase.paymentStatus,
        purchaseStatus: purchase.purchaseStatus,
        notes: purchase.notes,
        items: purchase.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productVariantId: item.productVariantId,
          variantName: item.variantName,
          quantity: item.quantity,
          costPrice: item.costPrice,
          section: item.section,
          rack: item.rack,
          bin: item.bin,
        })),
      })
    }
  }, [purchase, reset])

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.costPrice) || 0),
    0,
  )
  const taxAmount = Math.round(subtotal * 0.15 * 100) / 100

  if (isLoading) {
    return (
      <LoadingSpinner size="lg" layout="form" />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier *</Label>
            <Select id="supplierId" {...register('supplierId')}>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
            {errors.supplierId ? (
              <p className="text-sm text-destructive">{errors.supplierId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input id="invoiceNumber" {...register('invoiceNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date *</Label>
            <Input id="purchaseDate" type="date" {...register('purchaseDate')} />
            {errors.purchaseDate ? (
              <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse *</Label>
            <Select id="warehouseId" {...register('warehouseId')}>
              <option value="">Select warehouse</option>
              {warehousesData?.data.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
            {errors.warehouseId ? (
              <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select id="paymentStatus" {...register('paymentStatus')}>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseStatus">Purchase Status</Label>
            <Select id="purchaseStatus" {...register('purchaseStatus')}>
              {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Purchase Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <PurchaseItemRow
              key={field.id}
              index={index}
              register={register}
              watch={watch}
              setValue={setValue}
              remove={remove}
              canRemove={fields.length > 1}
            />
          ))}
          {errors.items ? (
            <p className="text-sm text-destructive">{errors.items.message ?? 'Check purchase items.'}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes & Totals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...register('notes')} />
          </div>
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (15%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <span>Total Amount</span>
              <span>{formatCurrency(subtotal + taxAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
        </Button>
      </div>
    </form>
  )
}
