import { useNavigate, useSearchParams } from 'react-router-dom'
import { PurchasePageHeader } from '@/features/purchases/components/PurchasePageHeader'
import { ReceiveStockForm } from '@/features/purchases/components/ReceiveStockForm'
import { PURCHASE_ROUTES } from '@/features/purchases/constants'
import { useReceivePurchase } from '@/features/purchases/hooks/use-purchases'
import type { ReceivePurchaseFormOutput } from '@/features/purchases/schemas/purchase.schema'
import { useAuth } from '@/hooks/useAuth'

function getUserDisplayName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function ReceiveStockPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const purchaseId = searchParams.get('purchaseId') ?? undefined
  const { user } = useAuth()
  const receivePurchase = useReceivePurchase()

  const handleSubmit = async (values: ReceivePurchaseFormOutput) => {
    if (!user) return
    const updated = await receivePurchase.mutateAsync({
      purchaseId: values.purchaseId,
      items: values.items.filter((item) => item.quantity > 0),
      userId: user.id,
      userName: getUserDisplayName(user),
    })
    navigate(PURCHASE_ROUTES.DETAIL(updated.id))
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PurchasePageHeader
        title="Receive Stock"
        description="Receive inventory from supplier purchases with partial receiving support."
        backTo={PURCHASE_ROUTES.LIST}
        backLabel="Back to purchases"
      />
      <ReceiveStockForm
        selectedPurchaseId={purchaseId}
        isSubmitting={receivePurchase.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
