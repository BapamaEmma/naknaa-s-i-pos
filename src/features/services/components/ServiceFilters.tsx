import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SERVICE_STATUS_LABELS } from '@/features/services/constants'
import { useServiceCategories } from '@/features/services/hooks/use-services'
import type { ServiceListFilters } from '@/features/services/types'

interface ServiceFiltersProps {
  filters: ServiceListFilters
  onChange: (filters: ServiceListFilters) => void
}

export function ServiceFilters({ filters, onChange }: ServiceFiltersProps) {
  const { data: categories = [], isLoading } = useServiceCategories()

  const update = (patch: Partial<ServiceListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="service-search">Search</Label>
          <Input
            id="service-search"
            placeholder="Search by service name or code"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-category">Category</Label>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Select
              id="service-category"
              value={filters.categoryId ?? 'all'}
              onChange={(event) =>
                update({
                  categoryId: event.target.value as ServiceListFilters['categoryId'],
                })
              }
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-status">Status</Label>
          <Select
            id="service-status"
            value={filters.status ?? 'all'}
            onChange={(event) =>
              update({ status: event.target.value as ServiceListFilters['status'] })
            }
          >
            <option value="all">All statuses</option>
            {Object.entries(SERVICE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
