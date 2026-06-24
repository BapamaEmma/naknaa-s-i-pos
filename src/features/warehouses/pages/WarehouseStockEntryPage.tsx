import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { WarehouseStockEntryForm } from '@/features/warehouses/components/WarehouseStockEntryForm'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import { useAddWarehouseStock } from '@/features/warehouses/hooks/use-warehouses'
import type { WarehouseStockEntryFormOutput } from '@/features/warehouses/schemas/warehouse.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'
import { Button } from '@/components/ui/button'

export function WarehouseStockEntryPage() {
  const { user, hasRole } = useAuth()
  const [searchParams] = useSearchParams()
  const defaultWarehouseId = searchParams.get('warehouse') ?? undefined
  const addStock = useAddWarehouseStock()
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole(USER_ROLES.ADMIN)) {
    return <Navigate to={WAREHOUSE_ROUTES.LIST} replace />
  }

  const handleSubmit = async (values: WarehouseStockEntryFormOutput) => {
    if (!user) return

    setMessage(null)
    setErrorMessage(null)

    try {
      const record = await addStock.mutateAsync({
        ...values,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim(),
      })

      setMessage(
        `Added ${values.quantity} unit(s) of ${record.productName} (${record.brand}, ${record.color}) to ${record.warehouseName}.`,
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add stock to warehouse.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Add Stocks to Warehouse"
        description="Record which warehouse holds an item — name, brand, color, and quantity. Staff can search later to find it quickly."
        backTo={WAREHOUSE_ROUTES.LIST}
        backLabel="Back to warehouses"
        action={
          <Button variant="outline" asChild>
            <Link to={WAREHOUSE_ROUTES.LOCATIONS}>View inventory locations</Link>
          </Button>
        }
      />

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <WarehouseStockEntryForm
        defaultWarehouseId={defaultWarehouseId}
        isSubmitting={addStock.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
