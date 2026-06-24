import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  PURCHASE_ORDER_STATUS_LABELS,
} from '@/features/purchases/constants'
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormInput,
  type PurchaseOrderFormOutput,
} from '@/features/purchases/schemas/purchase.schema'
import { useCreatePurchaseOrder } from '@/features/purchases/hooks/use-purchases'
import type { PurchaseOrder } from '@/features/purchases/types'
import { useInventoryProducts, useInventoryVariants } from '@/features/inventory/hooks/use-inventory'
import { useSupplierOptions } from '@/features/suppliers/hooks/use-suppliers'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/format'

function OrderItemFields({
  index,
  register,
  watch,
  setValue,
}: {
  index: number
  register: ReturnType<typeof useForm<PurchaseOrderFormInput>>['register']
  watch: ReturnType<typeof useForm<PurchaseOrderFormInput>>['watch']
  setValue: ReturnType<typeof useForm<PurchaseOrderFormInput>>['setValue']
}) {
  const productId = watch(`items.${index}.productId`)
  const { data: products = [] } = useInventoryProducts()
  const { data: variants = [] } = useInventoryVariants(productId || undefined)

  return (
    <div className="grid gap-3 md:grid-cols-4">
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
        <option value="">Product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </Select>
      <Select
        value={watch(`items.${index}.productVariantId`)}
        onChange={(event) => {
          const selected = variants.find((entry) => entry.id === event.target.value)
          setValue(`items.${index}.productVariantId`, event.target.value)
          setValue(`items.${index}.variantName`, selected?.name ?? '')
        }}
      >
        <option value="">Variant</option>
        {variants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.name}
          </option>
        ))}
      </Select>
      <Input type="number" min={1} placeholder="Qty" {...register(`items.${index}.quantity`)} />
      <Input type="number" min={0} step="0.01" placeholder="Cost" {...register(`items.${index}.costPrice`)} />
    </div>
  )
}

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[]
  isLoading?: boolean
}

export function PurchaseOrderTable({ orders, isLoading }: PurchaseOrderTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuth()
  const createOrder = useCreatePurchaseOrder()
  const { data: suppliers = [] } = useSupplierOptions()
  const { data: warehousesData } = useWarehouses({ page: 1, limit: 100, status: 'active' })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
  } = useForm<PurchaseOrderFormInput, unknown, PurchaseOrderFormOutput>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplierId: '',
      warehouseId: '',
      notes: '',
      items: [{ productId: '', productName: '', productVariantId: '', variantName: '', quantity: 1, costPrice: 0 }],
    },
  })

  const { fields, append } = useFieldArray({ control, name: 'items' })

  const onSubmit = handleSubmit(async (values: PurchaseOrderFormOutput) => {
    if (!user) return
    await createOrder.mutateAsync({
      ...values,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`.trim(),
    })
    setDialogOpen(false)
    reset()
  })

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Purchase Orders</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.supplierName}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.warehouseName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {PURCHASE_ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Select {...register('supplierId')}>
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warehouse *</Label>
                  <Select {...register('warehouseId')}>
                    <option value="">Select warehouse</option>
                    {warehousesData?.data.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.warehouseName}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea rows={2} {...register('notes')} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Products</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        productId: '',
                        productName: '',
                        productVariantId: '',
                        variantName: '',
                        quantity: 1,
                        costPrice: 0,
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <OrderItemFields
                    key={field.id}
                    index={index}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Creating...' : 'Create Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
