import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InventoryHistoryFilters } from '@/features/inventory/components/InventoryHistoryFilters'
import { InventoryHistoryTable } from '@/features/inventory/components/InventoryHistoryTable'
import { PageHeader } from '@/features/inventory/components/PageHeader'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import {
  useInventoryBranches,
  useInventoryHistory,
  useInventoryProducts,
} from '@/features/inventory/hooks/use-inventory'
import type { InventoryHistoryFilters as HistoryFilters } from '@/features/inventory/types'

export function InventoryHistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    limit: 10,
    transactionType: 'all',
  })

  const { data: branches = [] } = useInventoryBranches()
  const { data: products = [] } = useInventoryProducts()
  const { data, isLoading } = useInventoryHistory(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Inventory History"
        description="Review all inventory transactions across branches."
        backTo={INVENTORY_ROUTES.DASHBOARD}
        backLabel="Back to inventory"
      />

      <InventoryHistoryFilters
        filters={filters}
        branches={branches}
        products={products}
        onChange={setFilters}
      />

      <InventoryHistoryTable data={data} isLoading={isLoading} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
