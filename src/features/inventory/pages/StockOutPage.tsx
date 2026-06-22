import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { StockOutForm } from '@/features/inventory/components/StockOutForm'
import { PageHeader } from '@/features/inventory/components/PageHeader'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import { useStockOut } from '@/features/inventory/hooks/use-inventory'
import type { StockOutFormOutput } from '@/features/inventory/schemas/inventory.schema'

export function StockOutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const stockOut = useStockOut()

  const handleSubmit = async (values: StockOutFormOutput) => {
    if (!user) return

    await stockOut.mutateAsync({
      ...values,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    })

    navigate(INVENTORY_ROUTES.DASHBOARD)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Stock Out"
        description="Remove stock manually from branch inventory."
        backTo={INVENTORY_ROUTES.DASHBOARD}
        backLabel="Back to inventory"
      />

      <StockOutForm
        initialProductId={searchParams.get('productId') ?? ''}
        initialVariantId={searchParams.get('variantId') ?? ''}
        initialBranchId={searchParams.get('branchId') ?? ''}
        isSubmitting={stockOut.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
