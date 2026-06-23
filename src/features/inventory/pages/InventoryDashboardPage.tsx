import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCategories as useAllCategories } from '@/features/products/hooks/use-products'
import { InventoryFilters } from '@/features/inventory/components/InventoryFilters'
import { InventoryQuickActions } from '@/features/inventory/components/InventoryQuickActions'
import { InventoryStatsCards } from '@/features/inventory/components/InventoryStatsCards'
import { InventoryTable } from '@/features/inventory/components/InventoryTable'
import { PageHeader } from '@/features/inventory/components/PageHeader'
import {
  useInventory,
  useInventoryBranches,
  useInventorySummary,
} from '@/features/inventory/hooks/use-inventory'
import type { InventoryListFilters } from '@/features/inventory/types'
import { ProductLocator } from '@/features/warehouses'

export function InventoryDashboardPage() {
  const [filters, setFilters] = useState<InventoryListFilters>({
    page: 1,
    limit: 10,
    status: 'all',
  })

  const { data: summary, isLoading: summaryLoading } = useInventorySummary()
  const { data: categories = [] } = useAllCategories()
  const { data: branches = [] } = useInventoryBranches()
  const { data, isLoading } = useInventory(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Inventory"
        description="Monitor stock levels, value, and branch inventory activity."
      />

      {summaryLoading || !summary ? (
        <div className="flex min-h-32 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <InventoryStatsCards summary={summary} />
      )}

      <InventoryQuickActions />

      <ProductLocator compact />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Current Inventory</h2>
          <p className="text-sm text-muted-foreground">Live stock levels across all branches.</p>
        </div>

        <InventoryFilters
          filters={filters}
          categories={categories}
          branches={branches}
          onChange={setFilters}
        />

        <InventoryTable data={data} isLoading={isLoading} />

        {data && data.meta.totalPages > 1 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} records
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
    </div>
  )
}
