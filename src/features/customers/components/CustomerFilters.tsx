import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { CustomerListFilters } from '@/features/customers/types'

interface CustomerFiltersProps {
  filters: CustomerListFilters
  onChange: (filters: CustomerListFilters) => void
}

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const update = (patch: Partial<CustomerListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customer-search">Search</Label>
          <Input
            id="customer-search"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Search by name, phone, or customer code"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-status">Filter</Label>
          <Select
            id="customer-status"
            value={filters.status ?? 'all'}
            onChange={(event) =>
              update({ status: event.target.value as CustomerListFilters['status'] })
            }
          >
            <option value="all">All customers</option>
            <option value="active">Active customers</option>
            <option value="inactive">Inactive customers</option>
            <option value="new">New customers (30 days)</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
