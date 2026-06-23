import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightLeft, MapPin, PackagePlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { WarehouseDeleteDialog } from '@/features/warehouses/components/WarehouseDeleteDialog'
import { WarehouseFilters } from '@/features/warehouses/components/WarehouseFilters'
import { WarehouseInventoryReport } from '@/features/warehouses/components/WarehouseInventoryReport'
import { WarehouseStatsCards } from '@/features/warehouses/components/WarehouseStatsCards'
import { WarehouseTable } from '@/features/warehouses/components/WarehouseTable'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import {
  useWarehouseDashboard,
  useWarehouseInventoryReport,
  useWarehouses,
} from '@/features/warehouses/hooks/use-warehouses'
import type { WarehouseListFilters, WarehouseListItem } from '@/features/warehouses/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function WarehouseListPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [filters, setFilters] = useState<WarehouseListFilters>({ page: 1, limit: 10, status: 'all' })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseListItem | null>(null)

  const { data: summary, isLoading: summaryLoading } = useWarehouseDashboard()
  const { data: report, isLoading: reportLoading } = useWarehouseInventoryReport()
  const { data, isLoading } = useWarehouses(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Warehouses"
        description="Manage warehouse locations, track stock placement, and monitor warehouse performance."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={WAREHOUSE_ROUTES.LOCATIONS}>
                <MapPin className="h-4 w-4" />
                Locations
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={WAREHOUSE_ROUTES.TRANSFERS}>
                <ArrowRightLeft className="h-4 w-4" />
                Transfers
              </Link>
            </Button>
            {canManage ? (
              <>
                <Button variant="outline" asChild>
                  <Link to={WAREHOUSE_ROUTES.STOCK_ENTRY}>
                    <PackagePlus className="h-4 w-4" />
                    Add Stocks to Warehouse
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={WAREHOUSE_ROUTES.CREATE}>
                    <Plus className="h-4 w-4" />
                    Add Warehouse
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      <WarehouseStatsCards summary={summary} isLoading={summaryLoading} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Warehouse Inventory Report</h2>
        <WarehouseInventoryReport rows={report} isLoading={reportLoading} />
      </div>

      <WarehouseFilters filters={filters} onChange={setFilters} />
      <WarehouseTable
        data={data}
        isLoading={isLoading}
        canManage={canManage}
        onDelete={(warehouse) => {
          setSelectedWarehouse(warehouse)
          setDeleteOpen(true)
        }}
      />

      {data && data.meta.totalPages > 1 ? (
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
      ) : null}

      <WarehouseDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} warehouse={selectedWarehouse} />
    </div>
  )
}
