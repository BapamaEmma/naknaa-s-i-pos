import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PAYMENT_METHODS } from '@/features/sales/constants'
import type { CashierOption, SalesCustomerOption, SalesListFilters } from '@/features/sales/types'

interface SalesFiltersProps {
  filters: SalesListFilters
  customers: SalesCustomerOption[]
  cashiers: CashierOption[]
  onChange: (filters: SalesListFilters) => void
}

export function SalesFilters({ filters, customers, cashiers, onChange }: SalesFiltersProps) {
  const update = (patch: Partial<SalesListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2 xl:col-span-3">
          <Label htmlFor="sales-search">Search</Label>
          <Input
            id="sales-search"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Receipt number, customer, or seller"
          />
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

        <div className="space-y-2">
          <Label htmlFor="customer-filter">Customer</Label>
          <Select
            id="customer-filter"
            value={filters.customerId ?? ''}
            onChange={(event) => update({ customerId: event.target.value || undefined })}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashier-filter">Seller</Label>
          <Select
            id="cashier-filter"
            value={filters.cashierId ?? ''}
            onChange={(event) => update({ cashierId: event.target.value || undefined })}
          >
            <option value="">All sellers</option>
            {cashiers.map((cashier) => (
              <option key={cashier.id} value={cashier.id}>
                {cashier.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-filter">Payment Method</Label>
          <Select
            id="payment-filter"
            value={filters.paymentMethod ?? 'all'}
            onChange={(event) =>
              update({
                paymentMethod: event.target.value as SalesListFilters['paymentMethod'],
              })
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
