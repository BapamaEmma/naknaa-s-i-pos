import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteWarehouse } from '@/features/warehouses/hooks/use-warehouses'
import type { WarehouseListItem } from '@/features/warehouses/types'

interface WarehouseDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse: WarehouseListItem | null
}

export function WarehouseDeleteDialog({ open, onOpenChange, warehouse }: WarehouseDeleteDialogProps) {
  const deleteWarehouse = useDeleteWarehouse()

  const handleDelete = async () => {
    if (!warehouse) return
    try {
      await deleteWarehouse.mutateAsync(warehouse.id)
      onOpenChange(false)
    } catch {
      // surfaced via mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete warehouse</DialogTitle>
          <DialogDescription>
            Delete {warehouse?.warehouseName}? Warehouses with stock cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        {deleteWarehouse.isError ? (
          <p className="text-sm text-destructive">
            {deleteWarehouse.error instanceof Error ? deleteWarehouse.error.message : 'Unable to delete warehouse.'}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteWarehouse.isPending}>
            {deleteWarehouse.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
