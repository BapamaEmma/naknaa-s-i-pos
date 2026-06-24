import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  supplierProductFormSchema,
  type SupplierProductFormInput,
  type SupplierProductFormOutput,
} from '@/features/suppliers/schemas/supplier.schema'
import { useInventoryProducts, useInventoryVariants } from '@/features/inventory/hooks/use-inventory'
import { useSupplierOptions } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierProductDetail } from '@/features/suppliers/types'

interface SupplierProductFormProps {
  supplierProduct?: SupplierProductDetail
  fixedSupplierId?: string
  fixedSupplierName?: string
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: SupplierProductFormOutput) => Promise<void>
}

export function SupplierProductForm({
  supplierProduct,
  fixedSupplierId,
  fixedSupplierName,
  isSubmitting = false,
  submitLabel = 'Add items',
  onSubmit,
}: SupplierProductFormProps) {
  const { data: suppliers = [] } = useSupplierOptions()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierProductFormInput, unknown, SupplierProductFormOutput>({
    resolver: zodResolver(supplierProductFormSchema),
    defaultValues: {
      supplierId: fixedSupplierId ?? '',
      productId: '',
      productVariantId: '',
      quantitySupplied: 1,
      costPrice: 0,
      dateSupplied: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  })

  const supplierId = watch('supplierId')
  const productId = watch('productId')
  const { data: products = [] } = useInventoryProducts()
  const { data: variants = [] } = useInventoryVariants(productId || undefined)

  useEffect(() => {
    if (supplierProduct) {
      reset({
        supplierId: supplierProduct.supplierId,
        productId: supplierProduct.productId,
        productVariantId: supplierProduct.productVariantId,
        quantitySupplied: supplierProduct.quantitySupplied,
        costPrice: supplierProduct.costPrice,
        dateSupplied: supplierProduct.dateSupplied.slice(0, 10),
        notes: supplierProduct.notes,
      })
    } else if (fixedSupplierId) {
      setValue('supplierId', fixedSupplierId)
    }
  }, [supplierProduct, fixedSupplierId, reset, setValue])

  useEffect(() => {
    if (!productId) {
      setValue('productVariantId', '')
    }
  }, [productId, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add items</CardTitle>
          <CardDescription>
            Record items supplied by this vendor including quantity and cost price.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="supplierId">Supplier *</Label>
            {fixedSupplierId && fixedSupplierName ? (
              <>
                <Input id="supplier-display" value={fixedSupplierName} disabled />
                <input type="hidden" {...register('supplierId')} />
              </>
            ) : (
              <Select id="supplierId" {...register('supplierId')}>
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            )}
            {errors.supplierId ? (
              <p className="text-sm text-destructive">{errors.supplierId.message}</p>
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
            <Label htmlFor="productVariantId">Product Variant *</Label>
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
            <Label htmlFor="quantitySupplied">Quantity Supplied *</Label>
            <Input id="quantitySupplied" type="number" min={1} {...register('quantitySupplied')} />
            {errors.quantitySupplied ? (
              <p className="text-sm text-destructive">{errors.quantitySupplied.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (GHS) *</Label>
            <Input id="costPrice" type="number" min={0} step="0.01" {...register('costPrice')} />
            {errors.costPrice ? (
              <p className="text-sm text-destructive">{errors.costPrice.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateSupplied">Date Supplied *</Label>
            <Input id="dateSupplied" type="date" {...register('dateSupplied')} />
            {errors.dateSupplied ? (
              <p className="text-sm text-destructive">{errors.dateSupplied.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || (!fixedSupplierId && !supplierId)}>
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
