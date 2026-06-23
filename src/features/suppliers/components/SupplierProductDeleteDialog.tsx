import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteSupplierProduct } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierProductListItem } from '@/features/suppliers/types'

interface SupplierProductDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: SupplierProductListItem | null
}

export function SupplierProductDeleteDialog({
  open,
  onOpenChange,
  product,
}: SupplierProductDeleteDialogProps) {
  const deleteProduct = useDeleteSupplierProduct()

  const handleDelete = async () => {
    if (!product) return

    try {
      await deleteProduct.mutateAsync(product.id)
      onOpenChange(false)
    } catch {
      // Error surfaced via mutation state
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete supplier product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the supply record for {product?.productName} (
            {product?.variantName})?
          </DialogDescription>
        </DialogHeader>

        {deleteProduct.isError ? (
          <p className="text-sm text-destructive">
            {deleteProduct.error instanceof Error
              ? deleteProduct.error.message
              : 'Unable to delete supplier product.'}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
