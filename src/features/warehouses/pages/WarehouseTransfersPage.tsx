import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/features/warehouses/components/PageHeader'
import { TransferForm } from '@/features/warehouses/components/TransferForm'
import { TransferTable } from '@/features/warehouses/components/TransferTable'
import { WAREHOUSE_ROUTES } from '@/features/warehouses/constants'
import { useCreateTransfer, useTransfers } from '@/features/warehouses/hooks/use-warehouses'
import type { TransferFormOutput } from '@/features/warehouses/schemas/warehouse.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function WarehouseTransfersPage() {
  const { user, hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [filters, setFilters] = useState({ page: 1, limit: 10 })
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: transfers, isLoading } = useTransfers(filters)
  const createTransfer = useCreateTransfer()

  const handleSubmit = async (values: TransferFormOutput) => {
    if (!user) return

    setMessage(null)
    setErrorMessage(null)

    try {
      const transfer = await createTransfer.mutateAsync({
        ...values,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim(),
      })
      setMessage(`Transfer ${transfer.transferNumber} completed successfully.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete transfer.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Warehouse Transfers"
        description="Move stock between warehouses and review transfer history."
        backTo={WAREHOUSE_ROUTES.LIST}
        backLabel="Back to warehouses"
        action={
          <Link to={WAREHOUSE_ROUTES.LOCATIONS} className="text-sm text-primary hover:underline">
            View locations
          </Link>
        }
      />

      {canManage ? (
        <>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <TransferForm isSubmitting={createTransfer.isPending} onSubmit={handleSubmit} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          You have view-only access. Contact an administrator to transfer stock.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransferTable data={transfers} isLoading={isLoading} />
          {transfers && transfers.meta.totalPages > 1 ? (
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                disabled={transfers.meta.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                disabled={transfers.meta.page >= transfers.meta.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
              >
                Next
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
