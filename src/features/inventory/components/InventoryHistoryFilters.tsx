import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TRANSACTION_TYPE_LABELS } from '@/features/inventory/constants'
import type { Branch, InventoryHistoryFilters, ProductOption } from '@/features/inventory/types'

interface InventoryHistoryFiltersProps {
  filters: InventoryHistoryFilters
  branches: Branch[]
  products: ProductOption[]
  onChange: (filters: InventoryHistoryFilters) => void
}

export function InventoryHistoryFilters({
  filters,
  branches,
  products,
  onChange,
}: InventoryHistoryFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor="date-from">Date From</Label>
        <Input
          id="date-from"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) => onChange({ ...filters, dateFrom: event.target.value || undefined, page: 1 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-to">Date To</Label>
        <Input
          id="date-to"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) => onChange({ ...filters, dateTo: event.target.value || undefined, page: 1 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="history-product">Product</Label>
        <Select
          id="history-product"
          value={filters.productId ?? 'all'}
          onChange={(event) =>
            onChange({
              ...filters,
              productId: event.target.value === 'all' ? undefined : event.target.value,
              page: 1,
            })
          }
        >
          <option value="all">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="history-branch">Branch</Label>
        <Select
          id="history-branch"
          value={filters.branchId ?? 'all'}
          onChange={(event) =>
            onChange({
              ...filters,
              branchId: event.target.value === 'all' ? undefined : event.target.value,
              page: 1,
            })
          }
        >
          <option value="all">All branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="history-type">Transaction Type</Label>
        <Select
          id="history-type"
          value={filters.transactionType ?? 'all'}
          onChange={(event) =>
            onChange({
              ...filters,
              transactionType: event.target.value as InventoryHistoryFilters['transactionType'],
              page: 1,
            })
          }
        >
          <option value="all">All types</option>
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
