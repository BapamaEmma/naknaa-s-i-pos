import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  stockInSchema,
  type StockInFormInput,
  type StockInFormOutput,
} from '@/features/inventory/schemas/inventory.schema'
import { MOCK_SUPPLIERS } from '@/features/inventory/constants'
import {
  useInventoryBranches,
  useInventoryProducts,
  useInventoryVariants,
} from '@/features/inventory/hooks/use-inventory'
import type { Branch } from '@/features/inventory/types'

interface StockInFormProps {
  initialProductId?: string
  initialVariantId?: string
  initialBranchId?: string
  isSubmitting?: boolean
  onSubmit: (values: StockInFormOutput) => Promise<void>
}

export function StockInForm({
  initialProductId = '',
  initialVariantId = '',
  initialBranchId = '',
  isSubmitting = false,
  onSubmit,
}: StockInFormProps) {
  const { data: products = [] } = useInventoryProducts()
  const { data: branches = [] } = useInventoryBranches()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StockInFormInput, unknown, StockInFormOutput>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      productId: initialProductId,
      productVariantId: initialVariantId,
      branchId: initialBranchId,
      quantity: 1,
      unitCost: 0,
      supplier: MOCK_SUPPLIERS[0],
      notes: '',
    },
  })

  const productId = watch('productId')
  const branchId = watch('branchId')
  const { data: variants = [] } = useInventoryVariants(productId, branchId)

  useEffect(() => {
    reset({
      productId: initialProductId,
      productVariantId: initialVariantId,
      branchId: initialBranchId,
      quantity: 1,
      unitCost: 0,
      supplier: MOCK_SUPPLIERS[0],
      notes: '',
    })
  }, [initialProductId, initialVariantId, initialBranchId, reset])

  useEffect(() => {
    const variant = variants.find((entry) => entry.id === watch('productVariantId'))
    if (variant) {
      setValue('unitCost', variant.unitCost)
    }
  }, [variants, watch, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock In</CardTitle>
          <CardDescription>Add new stock into branch inventory.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="productId">Product</Label>
            <Select id="productId" {...register('productId')}>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
            {errors.productId ? <p className="text-sm text-destructive">{errors.productId.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productVariantId">Variant</Label>
            <Select id="productVariantId" {...register('productVariantId')}>
              <option value="">Select variant</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} (Current: {variant.currentQuantity})
                </option>
              ))}
            </Select>
            {errors.productVariantId ? (
              <p className="text-sm text-destructive">{errors.productVariantId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            <Select id="branchId" {...register('branchId')}>
              <option value="">Select branch</option>
              {branches.map((branch: Branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            {errors.branchId ? <p className="text-sm text-destructive">{errors.branchId.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min="1" {...register('quantity')} />
            {errors.quantity ? <p className="text-sm text-destructive">{errors.quantity.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitCost">Unit Cost</Label>
            <Input id="unitCost" type="number" min="0" step="0.01" {...register('unitCost')} />
            {errors.unitCost ? <p className="text-sm text-destructive">{errors.unitCost.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select id="supplier" {...register('supplier')}>
              {MOCK_SUPPLIERS.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </Select>
            {errors.supplier ? <p className="text-sm text-destructive">{errors.supplier.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              Submit Stock In
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
