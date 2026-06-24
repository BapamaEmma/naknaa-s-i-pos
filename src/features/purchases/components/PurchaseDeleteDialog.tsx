import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeletePurchase } from '@/features/purchases/hooks/use-purchases'
import type { PurchaseListItem } from '@/features/purchases/types'
import { useAuth } from '@/hooks/useAuth'

interface PurchaseDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchase: PurchaseListItem | null
}

export function PurchaseDeleteDialog({ open, onOpenChange, purchase }: PurchaseDeleteDialogProps) {
  const { user } = useAuth()
  const deletePurchase = useDeletePurchase()

  const handleDelete = async () => {
    if (!purchase || !user) return
    await deletePurchase.mutateAsync({
      id: purchase.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete purchase</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {purchase?.purchaseNumber}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deletePurchase.isPending}>
            {deletePurchase.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
