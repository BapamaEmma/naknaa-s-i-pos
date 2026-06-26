import { Link, useParams } from 'react-router-dom'
import { MapPin, PackagePlus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { InventoryLocationFiltersBar } from '@/features/warehouses/components/InventoryLocationFilters'
import { InventoryLocationTable } from '@/features/warehouses/components/InventoryLocationTable'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { ProductLocator } from '@/features/warehouses/components/ProductLocator'
import { WarehouseInfoCard } from '@/features/warehouses/components/WarehouseInfoCard'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import { useInventoryLocations, useWarehouse } from '@/features/warehouses/hooks/use-warehouses'
import type { InventoryLocationFilters } from '@/features/warehouses/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'
import { useState } from 'react'

export function WarehouseDetailsPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [inventoryFilters, setInventoryFilters] = useState<InventoryLocationFilters>({
    warehouseId: id,
    page: 1,
    limit: 10,
    stockStatus: 'all',
    categoryId: 'all',
  })

  const { data: warehouse, isLoading, isError } = useWarehouse(id)
  const { data: inventory, isLoading: inventoryLoading } = useInventoryLocations({
    ...inventoryFilters,
    warehouseId: id,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (isError || !warehouse) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Warehouse not found.</p>
        <Button asChild variant="outline">
          <Link to={WAREHOUSE_ROUTES.LIST}>Back to warehouses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={warehouse.warehouseName}
        description={`${warehouse.warehouseCode} · ${warehouse.manager || 'No manager assigned'}`}
        backTo={WAREHOUSE_ROUTES.LIST}
        backLabel="Back to warehouses"
        action={
          <>
            <Button variant="outline" asChild>
              <Link to={`${WAREHOUSE_ROUTES.LOCATIONS}?warehouse=${id}`}>
                <MapPin className="h-4 w-4" />
                View Inventory
              </Link>
            </Button>
            {canManage ? (
              <>
                <Button variant="outline" asChild>
                  <Link to={`${WAREHOUSE_ROUTES.STOCK_ENTRY}?warehouse=${id}`}>
                    <PackagePlus className="h-4 w-4" />
                    Add Stocks to Warehouse
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={WAREHOUSE_ROUTES.EDIT(id)}>
                    <Pencil className="h-4 w-4" />
                    Edit Warehouse
                  </Link>
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <WarehouseInfoCard warehouse={warehouse} />
      <ProductLocator compact />

      <Card>
        <CardHeader>
          <CardTitle>Inventory at {warehouse.warehouseName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InventoryLocationFiltersBar
            filters={inventoryFilters}
            onChange={(next) => setInventoryFilters({ ...next, warehouseId: id })}
          />
          <InventoryLocationTable data={inventory} isLoading={inventoryLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
