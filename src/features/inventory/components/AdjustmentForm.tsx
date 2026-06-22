import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  adjustmentSchema,
  type AdjustmentFormInput,
  type AdjustmentFormOutput,
} from '@/features/inventory/schemas/inventory.schema'
import {
  useInventoryBranches,
  useInventoryProducts,
  useInventoryVariants,
} from '@/features/inventory/hooks/use-inventory'
import type { Branch } from '@/features/inventory/types'

interface AdjustmentFormProps {
  initialProductId?: string
  initialVariantId?: string
  initialBranchId?: string
  isSubmitting?: boolean
  onSubmit: (values: AdjustmentFormOutput) => Promise<void>
}

export function AdjustmentForm({
  initialProductId = '',
  initialVariantId = '',
  initialBranchId = '',
  isSubmitting = false,
  onSubmit,
}: AdjustmentFormProps) {
  const { data: products = [] } = useInventoryProducts()
  const { data: branches = [] } = useInventoryBranches()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormInput, unknown, AdjustmentFormOutput>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: initialProductId,
      productVariantId: initialVariantId,
      branchId: initialBranchId,
      newQuantity: 0,
      reason: '',
    },
  })

  const productId = watch('productId')
  const branchId = watch('branchId')
  const variantId = watch('productVariantId')
  const newQuantity = watch('newQuantity')
  const { data: variants = [] } = useInventoryVariants(productId, branchId)

  const currentQuantity = useMemo(
    () => variants.find((variant) => variant.id === variantId)?.currentQuantity ?? 0,
    [variants, variantId],
  )

  const difference = Number(newQuantity) - currentQuantity

  useEffect(() => {
    reset({
      productId: initialProductId,
      productVariantId: initialVariantId,
      branchId: initialBranchId,
      newQuantity: 0,
      reason: '',
    })
  }, [initialProductId, initialVariantId, initialBranchId, reset])

  useEffect(() => {
    const selected = variants.find((variant) => variant.id === variantId)
    if (selected) {
      reset((current) => ({ ...current, newQuantity: selected.currentQuantity }))
    }
  }, [variantId, variants, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Adjustment</CardTitle>
          <CardDescription>Correct stock discrepancies after physical counts.</CardDescription>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="productVariantId">Variant</Label>
            <Select id="productVariantId" {...register('productVariantId')}>
              <option value="">Select variant</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </Select>
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
          </div>

          <div className="space-y-2">
            <Label>Current Quantity</Label>
            <Input value={currentQuantity} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newQuantity">New Quantity</Label>
            <Input id="newQuantity" type="number" min="0" {...register('newQuantity')} />
            {errors.newQuantity ? (
              <p className="text-sm text-destructive">{errors.newQuantity.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Difference</Label>
            <Input
              value={difference > 0 ? `+${difference}` : `${difference}`}
              readOnly
              disabled
              className={difference === 0 ? '' : difference > 0 ? 'text-emerald-600' : 'text-destructive'}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="reason">Adjustment Reason</Label>
            <Input id="reason" placeholder="Cycle count correction..." {...register('reason')} />
            {errors.reason ? <p className="text-sm text-destructive">{errors.reason.message}</p> : null}
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
              Save Adjustment
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
