import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SERVICE_JOB_STATUS_LABELS } from '@/features/services/constants'
import { useServiceCategories } from '@/features/services/hooks/use-services'
import type { ServiceJobListFilters } from '@/features/services/types'

interface ServiceJobFiltersProps {
  filters: ServiceJobListFilters
  onChange: (filters: ServiceJobListFilters) => void
  historyOnly?: boolean
}

export function ServiceJobFilters({ filters, onChange, historyOnly }: ServiceJobFiltersProps) {
  const { data: categories = [], isLoading } = useServiceCategories()

  const update = (patch: Partial<ServiceJobListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="job-search">Search</Label>
          <Input
            id="job-search"
            placeholder="Search by job number, customer, or service"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        {!historyOnly ? (
          <div className="space-y-2">
            <Label htmlFor="job-status">Status</Label>
            <Select
              id="job-status"
              value={filters.status ?? 'all'}
              onChange={(event) =>
                update({ status: event.target.value as ServiceJobListFilters['status'] })
              }
            >
              <option value="all">All statuses</option>
              {Object.entries(SERVICE_JOB_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="job-category">Category</Label>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Select
              id="job-category"
              value={filters.categoryId ?? 'all'}
              onChange={(event) =>
                update({
                  categoryId: event.target.value as ServiceJobListFilters['categoryId'],
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
          <Label htmlFor="job-date-from">Date From</Label>
          <Input
            id="job-date-from"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(event) => update({ dateFrom: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-date-to">Date To</Label>
          <Input
            id="job-date-to"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(event) => update({ dateTo: event.target.value || undefined })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
