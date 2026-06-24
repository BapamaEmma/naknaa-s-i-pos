import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InventoryLocationFiltersBar } from '@/features/warehouses/components/InventoryLocationFilters'
import { InventoryLocationTable } from '@/features/warehouses/components/InventoryLocationTable'
import { LocationForm } from '@/features/warehouses/components/LocationForm'
import { LocationTable } from '@/features/warehouses/components/LocationTable'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { ProductLocator } from '@/features/warehouses/components/ProductLocator'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import {
  useCreateLocation,
  useDeleteLocation,
  useInventoryLocations,
  useLocations,
  useUpdateLocation,
} from '@/features/warehouses/hooks/use-warehouses'
import type {
  InventoryLocationFilters,
  LocationListFilters,
  WarehouseLocation,
} from '@/features/warehouses/types'
import type { LocationFormOutput } from '@/features/warehouses/schemas/warehouse.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function WarehouseLocationsPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [searchParams] = useSearchParams()
  const defaultWarehouseId = searchParams.get('warehouse') ?? 'all'

  const [locationFilters, setLocationFilters] = useState<LocationListFilters>({
    page: 1,
    limit: 10,
    warehouseId: defaultWarehouseId,
  })
  const [inventoryFilters, setInventoryFilters] = useState<InventoryLocationFilters>({
    page: 1,
    limit: 10,
    warehouseId: defaultWarehouseId,
    stockStatus: 'all',
    categoryId: 'all',
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<WarehouseLocation | null>(null)

  const { data: locations, isLoading: locationsLoading } = useLocations(locationFilters)
  const { data: inventory, isLoading: inventoryLoading } = useInventoryLocations(inventoryFilters)
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const deleteLocation = useDeleteLocation()

  const dialogTitle = useMemo(
    () => (editingLocation ? 'Edit Location' : 'Add Location'),
    [editingLocation],
  )

  const openCreateDialog = () => {
    setEditingLocation(null)
    setDialogOpen(true)
  }

  const openEditDialog = (location: WarehouseLocation) => {
    setEditingLocation(location)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: LocationFormOutput) => {
    if (editingLocation) {
      await updateLocation.mutateAsync({ id: editingLocation.id, input: values })
    } else {
      await createLocation.mutateAsync(values)
    }
    setDialogOpen(false)
    setEditingLocation(null)
  }

  const handleDelete = async (location: WarehouseLocation) => {
    try {
      await deleteLocation.mutateAsync(location.id)
    } catch {
      // surfaced via mutation if needed
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Warehouse Locations"
        description="Manage storage sections, racks, bins, and locate products across warehouses."
        backTo={WAREHOUSE_ROUTES.LIST}
        backLabel="Back to warehouses"
        action={
          canManage ? (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          ) : null
        }
      />

      <ProductLocator />

      <Card>
        <CardHeader>
          <CardTitle>Location Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocationTable
            data={locations}
            isLoading={locationsLoading}
            canManage={canManage}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Location View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InventoryLocationFiltersBar
            filters={inventoryFilters}
            onChange={(next) => {
              setInventoryFilters(next)
              setLocationFilters((current) => ({
                ...current,
                warehouseId: next.warehouseId,
                page: 1,
              }))
            }}
          />
          <InventoryLocationTable data={inventory} isLoading={inventoryLoading} />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <LocationForm
            location={editingLocation ?? undefined}
            defaultWarehouseId={defaultWarehouseId !== 'all' ? defaultWarehouseId : undefined}
            isSubmitting={createLocation.isPending || updateLocation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
