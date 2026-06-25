import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteCustomer } from '@/features/customers/hooks/use-customers'
import type { CustomerListItem } from '@/features/customers/types'

interface CustomerDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerListItem | null
}

export function CustomerDeleteDialog({ open, onOpenChange, customer }: CustomerDeleteDialogProps) {
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = async () => {
    if (!customer) return

    try {
      await deleteCustomer.mutateAsync(customer.id)
      onOpenChange(false)
    } catch {
      // Error surfaced via mutation state if needed
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {customer?.fullName}? This permanently removes customers
            with no purchase history. Customers who have completed purchases can only be deactivated.
          </DialogDescription>
        </DialogHeader>

        {deleteCustomer.isError ? (
          <p className="text-sm text-destructive">
            {deleteCustomer.error instanceof Error
              ? deleteCustomer.error.message
              : 'Unable to delete customer.'}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
          >
            {deleteCustomer.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
