import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { WarehouseListFilters } from '@/features/warehouses/types'

interface WarehouseFiltersProps {
  filters: WarehouseListFilters
  onChange: (filters: WarehouseListFilters) => void
}

export function WarehouseFilters({ filters, onChange }: WarehouseFiltersProps) {
  const update = (patch: Partial<WarehouseListFilters>) => onChange({ ...filters, ...patch, page: 1 })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-search">Search</Label>
          <Input
            id="warehouse-search"
            placeholder="Search by warehouse name or code"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-status">Status</Label>
          <Select
            id="warehouse-status"
            value={filters.status ?? 'all'}
            onChange={(event) => update({ status: event.target.value as WarehouseListFilters['status'] })}
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
