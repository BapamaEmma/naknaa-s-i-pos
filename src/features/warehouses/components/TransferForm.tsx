import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  transferFormSchema,
  type TransferFormInput,
  type TransferFormOutput,
} from '@/features/warehouses/schemas/warehouse.schema'
import { TRANSFER_REASONS } from '@/features/warehouses/constants'
import { useInventoryProducts, useInventoryVariants } from '@/features/inventory/hooks/use-inventory'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'

interface TransferFormProps {
  isSubmitting?: boolean
  onSubmit: (values: TransferFormOutput) => Promise<void>
}

export function TransferForm({ isSubmitting = false, onSubmit }: TransferFormProps) {
  const { data: warehousesData } = useWarehouses({ page: 1, limit: 100, status: 'active' })
  const warehouses = warehousesData?.data ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferFormInput, unknown, TransferFormOutput>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromWarehouseId: '',
      toWarehouseId: '',
      productId: '',
      productVariantId: '',
      quantity: 1,
      reason: TRANSFER_REASONS[0],
      notes: '',
    },
  })

  const productId = watch('productId')
  const { data: products = [] } = useInventoryProducts()
  const { data: variants = [] } = useInventoryVariants(productId || undefined)

  useEffect(() => {
    if (!productId) setValue('productVariantId', '')
  }, [productId, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transfer Stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fromWarehouseId">From Warehouse *</Label>
            <Select id="fromWarehouseId" {...register('fromWarehouseId')}>
              <option value="">Select source</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
            {errors.fromWarehouseId ? (
              <p className="text-sm text-destructive">{errors.fromWarehouseId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="toWarehouseId">To Warehouse *</Label>
            <Select id="toWarehouseId" {...register('toWarehouseId')}>
              <option value="">Select destination</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
            {errors.toWarehouseId ? (
              <p className="text-sm text-destructive">{errors.toWarehouseId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productId">Product *</Label>
            <Select
              id="productId"
              {...register('productId')}
              onChange={(event) => {
                setValue('productId', event.target.value)
                setValue('productVariantId', '')
              }}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
            {errors.productId ? (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productVariantId">Variant *</Label>
            <Select id="productVariantId" {...register('productVariantId')} disabled={!productId}>
              <option value="">Select variant</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </Select>
            {errors.productVariantId ? (
              <p className="text-sm text-destructive">{errors.productVariantId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" type="number" min={1} {...register('quantity')} />
            {errors.quantity ? (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select id="reason" {...register('reason')}>
              {TRANSFER_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </Select>
            {errors.reason ? (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <ArrowRightLeft className="h-4 w-4" />
          {isSubmitting ? 'Transferring...' : 'Complete Transfer'}
        </Button>
      </div>
    </form>
  )
}
