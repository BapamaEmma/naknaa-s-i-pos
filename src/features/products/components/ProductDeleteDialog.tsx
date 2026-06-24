import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useDeleteProduct } from '@/features/products/hooks/use-products'
import type { ProductListItem } from '@/features/products/types'

interface ProductDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductListItem | null
  onDeleted?: () => void
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
  onDeleted,
}: ProductDeleteDialogProps) {
  const deleteProduct = useDeleteProduct()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!product) return

    setError(null)

    try {
      await deleteProduct.mutateAsync(product.id)
      onOpenChange(false)
      onDeleted?.()
    } catch (err) {
      const message =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message?: string }).message ?? '')
          : err instanceof Error
            ? err.message
            : 'Unable to delete this product. Please try again.'
      setError(message)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setError(null)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{product?.name}</strong>? It will be removed
            from the active catalog. You can still find it later under the Inactive status filter.
          </DialogDescription>
        </DialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteProduct.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending ? (
              <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            ) : (
              'Delete product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
