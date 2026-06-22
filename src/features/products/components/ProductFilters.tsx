import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { BrandOption, Category, ProductListFilters } from '@/features/products/types'

interface ProductFiltersProps {
  filters: ProductListFilters
  categories: Category[]
  brands: BrandOption[]
  onChange: (filters: ProductListFilters) => void
}

export function ProductFilters({ filters, categories, brands, onChange }: ProductFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          value={filters.search ?? ''}
          className="pl-9"
          onChange={(event) => onChange({ ...filters, search: event.target.value, page: 1 })}
        />
      </div>

      <Select
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

      <Select
        value={filters.brand ?? 'all'}
        onChange={(event) =>
          onChange({
            ...filters,
            brand: event.target.value === 'all' ? undefined : event.target.value,
            page: 1,
          })
        }
      >
        <option value="all">All brands</option>
        {brands.map((brand) => (
          <option key={brand.value} value={brand.value}>
            {brand.label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.status ?? 'all'}
        onChange={(event) =>
          onChange({
            ...filters,
            status: event.target.value as ProductListFilters['status'],
            page: 1,
          })
        }
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
    </div>
  )
}
