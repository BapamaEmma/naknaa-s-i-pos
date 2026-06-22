import { useState } from 'react'
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
import { useDeleteCategory } from '@/features/categories/hooks/use-categories'
import type { CategoryListItem } from '@/features/categories/types'

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryListItem | null
}

export function CategoryDeleteDialog({ open, onOpenChange, category }: CategoryDeleteDialogProps) {
  const deleteCategory = useDeleteCategory()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!category) return

    setError(null)

    try {
      await deleteCategory.mutateAsync(category.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete category.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{category?.name}</strong>? Categories with
            assigned products cannot be deleted.
          </DialogDescription>
        </DialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteCategory.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteCategory.isPending}>
            {deleteCategory.isPending ? (
              <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            ) : (
              'Delete category'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
