import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { WarehouseFormDialog } from '@/features/settings/components/WarehouseFormDialog'
import { WarehouseSettingsTable } from '@/features/settings/components/WarehouseSettingsTable'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useCreateWarehouse,
  useUpdateWarehouse,
  useWarehouses,
} from '@/features/settings/hooks/use-settings'
import type { WarehouseFormOutput } from '@/features/settings/schemas/settings.schema'
import type { SettingsWarehouse } from '@/features/settings/types'

export function WarehouseSettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<SettingsWarehouse | null>(null)

  const { data: warehouses = [], isLoading } = useWarehouses()
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()

  const handleSubmit = async (values: WarehouseFormOutput) => {
    if (editingWarehouse) {
      await updateWarehouse.mutateAsync({ id: editingWarehouse.id, input: values })
    } else {
      await createWarehouse.mutateAsync(values)
    }
  }

  const handleToggleStatus = async (warehouse: SettingsWarehouse) => {
    await updateWarehouse.mutateAsync({
      id: warehouse.id,
      input: { status: warehouse.status === 'active' ? 'inactive' : 'active' },
    })
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Warehouse Settings"
        description="Configure warehouse locations for inventory storage and transfers."
        backTo={SETTINGS_ROUTES.ROOT}
        action={
          <Button
            onClick={() => {
              setEditingWarehouse(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Create Warehouse
          </Button>
        }
      />

      <WarehouseSettingsTable
        warehouses={warehouses}
        isLoading={isLoading}
        onEdit={(warehouse) => {
          setEditingWarehouse(warehouse)
          setDialogOpen(true)
        }}
        onToggleStatus={handleToggleStatus}
      />

      <WarehouseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        warehouse={editingWarehouse}
        isSubmitting={createWarehouse.isPending || updateWarehouse.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
