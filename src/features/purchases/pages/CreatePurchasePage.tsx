import { useNavigate } from 'react-router-dom'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchasePageHeader } from '@/features/purchases/components/PurchasePageHeader'
import { PURCHASE_ROUTES } from '@/features/purchases/constants'
import { useCreatePurchase } from '@/features/purchases/hooks/use-purchases'
import type { PurchaseFormOutput } from '@/features/purchases/schemas/purchase.schema'
import { useAuth } from '@/hooks/useAuth'

function getUserDisplayName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function CreatePurchasePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createPurchase = useCreatePurchase()

  const handleSubmit = async (values: PurchaseFormOutput) => {
    if (!user) return
    const created = await createPurchase.mutateAsync({
      ...values,
      userId: user.id,
      userName: getUserDisplayName(user),
    })
    navigate(PURCHASE_ROUTES.DETAIL(created.id))
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PurchasePageHeader
        title="Create Purchase"
        description="Record a new supplier purchase and assign stock to a warehouse."
        backTo={PURCHASE_ROUTES.LIST}
        backLabel="Back to purchases"
      />
      <PurchaseForm isSubmitting={createPurchase.isPending} onSubmit={handleSubmit} />
    </div>
  )
}
