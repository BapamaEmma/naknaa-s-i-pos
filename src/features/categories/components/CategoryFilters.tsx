import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { CategoryListFilters } from '@/features/categories/types'

interface CategoryFiltersProps {
  filters: CategoryListFilters
  onChange: (filters: CategoryListFilters) => void
}

export function CategoryFilters({ filters, onChange }: CategoryFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search categories..."
          value={filters.search ?? ''}
          className="pl-9"
          onChange={(event) => onChange({ ...filters, search: event.target.value, page: 1 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-filter" className="sr-only">
          Status
        </Label>
        <Select
          id="status-filter"
          value={filters.status ?? 'all'}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as CategoryListFilters['status'],
              page: 1,
            })
          }
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort-by" className="sr-only">
          Sort by
        </Label>
        <Select
          id="sort-by"
          value={filters.sortBy ?? 'name'}
          onChange={(event) =>
            onChange({
              ...filters,
              sortBy: event.target.value as CategoryListFilters['sortBy'],
              page: 1,
            })
          }
        >
          <option value="name">Sort by Name</option>
          <option value="createdAt">Sort by Date Created</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort-order" className="sr-only">
          Sort order
        </Label>
        <Select
          id="sort-order"
          value={filters.sortOrder ?? 'asc'}
          onChange={(event) =>
            onChange({
              ...filters,
              sortOrder: event.target.value as CategoryListFilters['sortOrder'],
              page: 1,
            })
          }
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Select>
      </div>
    </div>
  )
}
