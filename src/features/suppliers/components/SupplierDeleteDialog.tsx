import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteSupplier } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierListItem } from '@/features/suppliers/types'

interface SupplierDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: SupplierListItem | null
}

export function SupplierDeleteDialog({ open, onOpenChange, supplier }: SupplierDeleteDialogProps) {
  const deleteSupplier = useDeleteSupplier()

  const handleDelete = async () => {
    if (!supplier) return

    try {
      await deleteSupplier.mutateAsync(supplier.id)
      onOpenChange(false)
    } catch {
      // Error surfaced via mutation state
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete supplier</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {supplier?.name}? Suppliers with supplied products
            cannot be deleted.
          </DialogDescription>
        </DialogHeader>

        {deleteSupplier.isError ? (
          <p className="text-sm text-destructive">
            {deleteSupplier.error instanceof Error
              ? deleteSupplier.error.message
              : 'Unable to delete supplier.'}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteSupplier.isPending}>
            {deleteSupplier.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
