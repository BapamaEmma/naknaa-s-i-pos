import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InventoryFilters } from '@/features/inventory/components/InventoryFilters'
import { LowStockTable } from '@/features/inventory/components/LowStockTable'
import { PageHeader } from '@/features/inventory/components/PageHeader'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import {
  useInventoryBranches,
  useInventorySummary,
  useLowStockInventory,
} from '@/features/inventory/hooks/use-inventory'
import { useCategories as useAllCategories } from '@/features/products/hooks/use-products'
import type { InventoryListFilters } from '@/features/inventory/types'

export function LowStockReportPage() {
  const [filters, setFilters] = useState<InventoryListFilters>({
    page: 1,
    limit: 10,
  })

  const { data: summary } = useInventorySummary()
  const { data: categories = [] } = useAllCategories()
  const { data: branches = [] } = useInventoryBranches()
  const { data, isLoading } = useLowStockInventory(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Low Stock Report"
        description="Products and variants below minimum stock levels."
        backTo={INVENTORY_ROUTES.DASHBOARD}
        backLabel="Back to inventory"
      />

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.lowStockProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Out Of Stock Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-destructive">{summary.outOfStockProducts}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <InventoryFilters
        filters={{ ...filters, status: 'all' }}
        categories={categories}
        branches={branches}
        onChange={setFilters}
      />

      <LowStockTable data={data} isLoading={isLoading} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} items
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
