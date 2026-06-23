import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteUser } from '@/features/users/hooks/use-users'
import type { UserListItem } from '@/features/users/types'

interface UserDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserListItem | null
}

export function UserDeleteDialog({ open, onOpenChange, user }: UserDeleteDialogProps) {
  const deleteUser = useDeleteUser()

  const handleDelete = async () => {
    if (!user) return

    try {
      await deleteUser.mutateAsync(user.id)
      onOpenChange(false)
    } catch {
      // Error surfaced via mutation state
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user?.fullName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteUser.isError ? (
          <p className="text-sm text-destructive">
            {deleteUser.error instanceof Error
              ? deleteUser.error.message
              : 'Unable to delete user.'}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteUser.isPending}>
            {deleteUser.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
