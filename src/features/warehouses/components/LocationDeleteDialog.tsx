import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteLocation } from '@/features/warehouses/hooks/use-warehouses'
import type { WarehouseLocation } from '@/features/warehouses/types'

interface LocationDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: WarehouseLocation | null
}

export function LocationDeleteDialog({ open, onOpenChange, location }: LocationDeleteDialogProps) {
  const deleteLocation = useDeleteLocation()

  const handleDelete = async () => {
    if (!location) return
    try {
      await deleteLocation.mutateAsync(location.id)
      onOpenChange(false)
    } catch {
      // surfaced via mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete location</DialogTitle>
          <DialogDescription>
            Delete {location?.section} / {location?.rack} / {location?.bin} in {location?.warehouseName}?
          </DialogDescription>
        </DialogHeader>
        {deleteLocation.isError ? (
          <p className="text-sm text-destructive">
            {deleteLocation.error instanceof Error ? deleteLocation.error.message : 'Unable to delete location.'}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLocation.isPending}>
            {deleteLocation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
