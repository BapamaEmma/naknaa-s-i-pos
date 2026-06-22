import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { StockInForm } from '@/features/inventory/components/StockInForm'
import { PageHeader } from '@/features/inventory/components/PageHeader'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import { useStockIn } from '@/features/inventory/hooks/use-inventory'
import type { StockInFormOutput } from '@/features/inventory/schemas/inventory.schema'

export function StockInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const stockIn = useStockIn()

  const handleSubmit = async (values: StockInFormOutput) => {
    if (!user) return

    await stockIn.mutateAsync({
      ...values,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    })

    navigate(INVENTORY_ROUTES.DASHBOARD)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Stock In"
        description="Add new stock into branch inventory."
        backTo={INVENTORY_ROUTES.DASHBOARD}
        backLabel="Back to inventory"
      />

      <StockInForm
        initialProductId={searchParams.get('productId') ?? ''}
        initialVariantId={searchParams.get('variantId') ?? ''}
        initialBranchId={searchParams.get('branchId') ?? ''}
        isSubmitting={stockIn.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
