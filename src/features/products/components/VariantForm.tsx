import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  variantFormSchema,
  type VariantFormInput,
  type VariantFormOutput,
} from '@/features/products/schemas/product.schema'
import type { ProductVariant } from '@/features/products/types'

interface VariantFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: ProductVariant | null
  isSubmitting?: boolean
  showCurrentStock?: boolean
  onSubmit: (values: VariantFormOutput) => Promise<void>
}

const defaultValues: VariantFormInput = {
  name: '',
  variantType: '',
  costPrice: 0,
  sellingPrice: 0,
  currentStock: 0,
  minimumStock: 0,
  isActive: 'true',
}

export function VariantForm({
  open,
  onOpenChange,
  variant,
  isSubmitting = false,
  showCurrentStock = true,
  onSubmit,
}: VariantFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormInput, unknown, VariantFormOutput>({
    resolver: zodResolver(variantFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (variant) {
      reset({
        name: variant.name,
        variantType: variant.variantType,
        costPrice: variant.costPrice,
        sellingPrice: variant.sellingPrice,
        currentStock: variant.currentStock,
        minimumStock: variant.minimumStock,
        isActive: variant.isActive ? 'true' : 'false',
      })
      return
    }

    reset(defaultValues)
  }, [open, variant, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{variant ? 'Edit variant' : 'Add variant'}</DialogTitle>
          <DialogDescription>
            {variant
              ? 'Update variant pricing and stock configuration.'
              : 'Create a new variant for this product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="variant-name">Variant Name</Label>
              <Input id="variant-name" {...register('name')} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="variant-type">Variant Type</Label>
              <Input id="variant-type" placeholder="Color, Key Count, Configuration..." {...register('variantType')} />
              {errors.variantType ? (
                <p className="text-sm text-destructive">{errors.variantType.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-price">Cost Price</Label>
              <Input id="cost-price" type="number" min="0" step="0.01" {...register('costPrice')} />
              {errors.costPrice ? (
                <p className="text-sm text-destructive">{errors.costPrice.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling-price">Selling Price</Label>
              <Input id="selling-price" type="number" min="0" step="0.01" {...register('sellingPrice')} />
              {errors.sellingPrice ? (
                <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>
              ) : null}
            </div>

            {showCurrentStock ? (
              <div className="space-y-2">
                <Label htmlFor="current-stock">Current Stock</Label>
                <Input id="current-stock" type="number" min="0" {...register('currentStock')} />
                {errors.currentStock ? (
                  <p className="text-sm text-destructive">{errors.currentStock.message}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="minimum-stock">Minimum Stock Level</Label>
              <Input id="minimum-stock" type="number" min="0" {...register('minimumStock')} />
              {errors.minimumStock ? (
                <p className="text-sm text-destructive">{errors.minimumStock.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="variant-status">Status</Label>
              <Select id="variant-status" {...register('isActive')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
              ) : variant ? (
                'Save changes'
              ) : (
                'Add variant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
