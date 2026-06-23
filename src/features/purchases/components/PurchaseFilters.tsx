import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  PAYMENT_STATUS_LABELS,
  PURCHASE_STATUS_LABELS,
} from '@/features/purchases/constants'
import type { PurchaseListFilters } from '@/features/purchases/types'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'

interface PurchaseFiltersProps {
  filters: PurchaseListFilters
  onChange: (filters: PurchaseListFilters) => void
}

export function PurchaseFilters({ filters, onChange }: PurchaseFiltersProps) {
  const { data: warehousesData, isLoading } = useWarehouses({ page: 1, limit: 100, status: 'all' })

  const update = (patch: Partial<PurchaseListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="purchase-search">Search</Label>
          <Input
            id="purchase-search"
            placeholder="Search by purchase number, supplier, or invoice"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-warehouse">Warehouse</Label>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Select
              id="purchase-warehouse"
              value={filters.warehouseId ?? 'all'}
              onChange={(event) =>
                update({ warehouseId: event.target.value as PurchaseListFilters['warehouseId'] })
              }
            >
              <option value="all">All warehouses</option>
              {warehousesData?.data.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-status">Purchase Status</Label>
          <Select
            id="purchase-status"
            value={filters.purchaseStatus ?? 'all'}
            onChange={(event) =>
              update({ purchaseStatus: event.target.value as PurchaseListFilters['purchaseStatus'] })
            }
          >
            <option value="all">All statuses</option>
            {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-status">Payment Status</Label>
          <Select
            id="payment-status"
            value={filters.paymentStatus ?? 'all'}
            onChange={(event) =>
              update({ paymentStatus: event.target.value as PurchaseListFilters['paymentStatus'] })
            }
          >
            <option value="all">All payments</option>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-from">Date From</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(event) => update({ dateFrom: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-to">Date To</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(event) => update({ dateTo: event.target.value || undefined })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
