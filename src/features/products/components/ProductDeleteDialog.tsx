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

  const handleDelete = async () => {
    if (!product) return

    await deleteProduct.mutateAsync(product.id)
    onOpenChange(false)
    onDeleted?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{product?.name}</strong>? All associated variants
            will also be removed.
          </DialogDescription>
        </DialogHeader>

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
