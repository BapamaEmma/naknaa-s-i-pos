import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { SupplierListFilters } from '@/features/suppliers/types'

interface SupplierFiltersProps {
  filters: SupplierListFilters
  onChange: (filters: SupplierListFilters) => void
}

export function SupplierFilters({ filters, onChange }: SupplierFiltersProps) {
  const update = (patch: Partial<SupplierListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplier-search">Search</Label>
          <Input
            id="supplier-search"
            placeholder="Search by supplier name, store, or city"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier-status">Status</Label>
          <Select
            id="supplier-status"
            value={filters.status ?? 'all'}
            onChange={(event) =>
              update({ status: event.target.value as SupplierListFilters['status'] })
            }
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
