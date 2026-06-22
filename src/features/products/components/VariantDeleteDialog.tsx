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
import { useDeleteVariant } from '@/features/products/hooks/use-variants'
import type { ProductVariant } from '@/features/products/types'

interface VariantDeleteDialogProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: ProductVariant | null
}

export function VariantDeleteDialog({
  productId,
  open,
  onOpenChange,
  variant,
}: VariantDeleteDialogProps) {
  const deleteVariant = useDeleteVariant(productId)

  const handleDelete = async () => {
    if (!variant) return
    await deleteVariant.mutateAsync(variant.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete variant</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the <strong>{variant?.name}</strong> variant?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteVariant.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteVariant.isPending}>
            {deleteVariant.isPending ? (
              <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            ) : (
              'Delete variant'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
