import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { Branch } from '@/features/inventory/types'
import type { Category } from '@/features/categories/types'
import type { InventoryListFilters } from '@/features/inventory/types'

interface InventoryFiltersProps {
  filters: InventoryListFilters
  categories: Category[]
  branches: Branch[]
  onChange: (filters: InventoryListFilters) => void
}

export function InventoryFilters({
  filters,
  categories,
  branches,
  onChange,
}: InventoryFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search product..."
          value={filters.search ?? ''}
          className="pl-9"
          onChange={(event) => onChange({ ...filters, search: event.target.value, page: 1 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-filter" className="sr-only">
          Category
        </Label>
        <Select
          id="category-filter"
          value={filters.categoryId ?? 'all'}
          onChange={(event) =>
            onChange({
              ...filters,
              categoryId: event.target.value === 'all' ? undefined : event.target.value,
              page: 1,
            })
          }
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch-filter" className="sr-only">
          Branch
        </Label>
        <Select
          id="branch-filter"
          value={filters.branchId ?? 'all'}
          onChange={(event) =>
            onChange({
              ...filters,
              branchId: event.target.value === 'all' ? undefined : event.target.value,
              page: 1,
            })
          }
        >
          <option value="all">All branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
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
              status: event.target.value as InventoryListFilters['status'],
              page: 1,
            })
          }
        >
          <option value="all">All statuses</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out Of Stock</option>
        </Select>
      </div>
    </div>
  )
}
