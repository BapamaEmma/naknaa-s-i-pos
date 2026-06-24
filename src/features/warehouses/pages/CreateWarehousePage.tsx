import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { WarehouseForm } from '@/features/warehouses/components/WarehouseForm'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import { useCreateWarehouse } from '@/features/warehouses/hooks/use-warehouses'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'
import { Navigate } from 'react-router-dom'
import type { WarehouseFormOutput } from '@/features/warehouses/schemas/warehouse.schema'

export function CreateWarehousePage() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const createWarehouse = useCreateWarehouse()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole(USER_ROLES.ADMIN)) {
    return <Navigate to={WAREHOUSE_ROUTES.LIST} replace />
  }

  const handleSubmit = async (values: WarehouseFormOutput) => {
    setErrorMessage(null)
    try {
      const warehouse = await createWarehouse.mutateAsync(values)
      navigate(WAREHOUSE_ROUTES.DETAIL(warehouse.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create warehouse.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create Warehouse"
        description="Add a new warehouse to the NakNaa storage network."
        backTo={WAREHOUSE_ROUTES.LIST}
        backLabel="Back to warehouses"
      />
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <WarehouseForm isSubmitting={createWarehouse.isPending} submitLabel="Create warehouse" onSubmit={handleSubmit} />
    </div>
  )
}
