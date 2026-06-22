import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AdjustmentForm } from '@/features/inventory/components/AdjustmentForm'
import { PageHeader } from '@/features/inventory/components/PageHeader'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import { useInventoryAdjustment } from '@/features/inventory/hooks/use-inventory'
import type { AdjustmentFormOutput } from '@/features/inventory/schemas/inventory.schema'

export function InventoryAdjustmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const adjustInventory = useInventoryAdjustment()

  const handleSubmit = async (values: AdjustmentFormOutput) => {
    if (!user) return

    await adjustInventory.mutateAsync({
      ...values,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    })

    navigate(INVENTORY_ROUTES.DASHBOARD)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Inventory Adjustment"
        description="Correct stock discrepancies after physical counts."
        backTo={INVENTORY_ROUTES.DASHBOARD}
        backLabel="Back to inventory"
      />

      <AdjustmentForm
        initialProductId={searchParams.get('productId') ?? ''}
        initialVariantId={searchParams.get('variantId') ?? ''}
        initialBranchId={searchParams.get('branchId') ?? ''}
        isSubmitting={adjustInventory.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
