import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryDeleteDialog } from '@/features/categories/components/CategoryDeleteDialog'
import { CategoryFilters } from '@/features/categories/components/CategoryFilters'
import { CategoryTable } from '@/features/categories/components/CategoryTable'
import { PageHeader } from '@/features/categories/components/PageHeader'
import { CATEGORY_ROUTES } from '@/features/categories/constants'
import { useCategories } from '@/features/categories/hooks/use-categories'
import type { CategoryListFilters, CategoryListItem } from '@/features/categories/types'

export function CategoryListPage() {
  const [filters, setFilters] = useState<CategoryListFilters>({
    page: 1,
    limit: 10,
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryListItem | null>(null)

  const { data, isLoading } = useCategories(filters)

  const openDeleteDialog = (category: CategoryListItem) => {
    setSelectedCategory(category)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Categories"
        description="Organize your inventory into product categories."
        action={
          <Button asChild>
            <Link to={CATEGORY_ROUTES.CREATE}>
              <Plus className="h-4 w-4" />
              Add Category
            </Link>
          </Button>
        }
      />

      <CategoryFilters filters={filters} onChange={setFilters} />
      <CategoryTable data={data} isLoading={isLoading} onDelete={openDeleteDialog} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} categories
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <CategoryDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
      />
    </div>
  )
}
