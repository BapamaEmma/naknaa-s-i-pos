import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { WarehouseForm } from '@/features/warehouses/components/WarehouseForm'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import { useUpdateWarehouse, useWarehouse } from '@/features/warehouses/hooks/use-warehouses'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'
import { Navigate } from 'react-router-dom'
import type { WarehouseFormOutput } from '@/features/warehouses/schemas/warehouse.schema'

export function EditWarehousePage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const { data: warehouse, isLoading, isError } = useWarehouse(id)
  const updateWarehouse = useUpdateWarehouse()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole(USER_ROLES.ADMIN)) {
    return <Navigate to={WAREHOUSE_ROUTES.DETAIL(id)} replace />
  }

  const handleSubmit = async (values: WarehouseFormOutput) => {
    setErrorMessage(null)
    try {
      await updateWarehouse.mutateAsync({ id, input: values })
      navigate(WAREHOUSE_ROUTES.DETAIL(id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update warehouse.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" layout="form" />
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
        title={`Edit ${warehouse.warehouseName}`}
        description={warehouse.warehouseCode}
        backTo={WAREHOUSE_ROUTES.DETAIL(id)}
        backLabel="Back to warehouse details"
      />
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <WarehouseForm warehouse={warehouse} isSubmitting={updateWarehouse.isPending} onSubmit={handleSubmit} />
    </div>
  )
}
