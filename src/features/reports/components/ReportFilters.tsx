import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ReportFilters } from '@/features/reports/types'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { useReportFilterOptions } from '@/features/reports/hooks/use-reports'

interface ReportFiltersProps {
  value: ReportFilters
  onChange: (filters: ReportFilters) => void
  showWarehouse?: boolean
  showUser?: boolean
  showCategory?: boolean
  showPeriod?: boolean
}

export function ReportFilters({
  value,
  onChange,
  showWarehouse = true,
  showUser = true,
  showCategory = true,
  showPeriod = false,
}: ReportFiltersProps) {
  const { data: options } = useReportFilterOptions()
  const [draft, setDraft] = useState<ReportFilters>(value)

  const merged = useMemo(() => ({ ...reportFilterDefaults, ...draft }), [draft])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Report Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Date From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={merged.dateFrom ?? ''}
            onChange={(event) => setDraft((current) => ({ ...current, dateFrom: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo">Date To</Label>
          <Input
            id="dateTo"
            type="date"
            value={merged.dateTo ?? ''}
            onChange={(event) => setDraft((current) => ({ ...current, dateTo: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branchId">Branch</Label>
          <Select
            id="branchId"
            value={merged.branchId ?? 'all'}
            onChange={(event) => setDraft((current) => ({ ...current, branchId: event.target.value }))}
          >
            <option value="all">All Branches</option>
            {(options?.branches ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </div>
        {showWarehouse ? (
          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse</Label>
            <Select
              id="warehouseId"
              value={merged.warehouseId ?? 'all'}
              onChange={(event) => setDraft((current) => ({ ...current, warehouseId: event.target.value }))}
            >
              <option value="all">All Warehouses</option>
              {(options?.warehouses ?? []).map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        {showUser ? (
          <div className="space-y-2">
            <Label htmlFor="userId">User</Label>
            <Select
              id="userId"
              value={merged.userId ?? 'all'}
              onChange={(event) => setDraft((current) => ({ ...current, userId: event.target.value }))}
            >
              <option value="all">All Users</option>
              {(options?.users ?? []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        {showCategory ? (
          <div className="space-y-2">
            <Label htmlFor="categoryId">Product Category</Label>
            <Select
              id="categoryId"
              value={merged.categoryId ?? 'all'}
              onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))}
            >
              <option value="all">All Categories</option>
              {(options?.categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        {showPeriod ? (
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              id="period"
              value={merged.period ?? 'monthly'}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  period: event.target.value as ReportFilters['period'],
                }))
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
        ) : null}
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
          <Button type="button" onClick={() => onChange(merged)}>
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(reportFilterDefaults)
              onChange(reportFilterDefaults)
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
