import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PAYMENT_METHODS } from '@/features/sales/constants'
import type { CustomerPurchaseFilters } from '@/features/customers/types'

interface PurchaseHistoryFiltersProps {
  filters: CustomerPurchaseFilters
  onChange: (filters: CustomerPurchaseFilters) => void
}

export function PurchaseHistoryFilters({ filters, onChange }: PurchaseHistoryFiltersProps) {
  const update = (patch: Partial<CustomerPurchaseFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="purchase-date-from">Date From</Label>
          <Input
            id="purchase-date-from"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(event) => update({ dateFrom: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-date-to">Date To</Label>
          <Input
            id="purchase-date-to"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(event) => update({ dateTo: event.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-payment">Payment Method</Label>
          <Select
            id="purchase-payment"
            value={filters.paymentMethod ?? 'all'}
            onChange={(event) =>
              update({ paymentMethod: event.target.value as CustomerPurchaseFilters['paymentMethod'] })
            }
          >
            <option value="all">All methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
