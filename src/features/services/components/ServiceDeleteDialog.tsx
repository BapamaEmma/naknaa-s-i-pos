import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteService } from '@/features/services/hooks/use-services'
import type { ServiceListItem } from '@/features/services/types'

interface ServiceDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ServiceListItem | null
}

export function ServiceDeleteDialog({ open, onOpenChange, service }: ServiceDeleteDialogProps) {
  const deleteService = useDeleteService()

  const handleDelete = async () => {
    if (!service) return

    try {
      await deleteService.mutateAsync(service.id)
      onOpenChange(false)
    } catch {
      // Error surfaced via mutation state
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete service</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {service?.serviceName}? Services with active jobs
            cannot be deleted.
          </DialogDescription>
        </DialogHeader>

        {deleteService.isError ? (
          <p className="text-sm text-destructive">
            {deleteService.error instanceof Error
              ? deleteService.error.message
              : 'Unable to delete service.'}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteService.isPending}>
            {deleteService.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
