import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchasePageHeader } from '@/features/purchases/components/PurchasePageHeader'
import { PURCHASE_ROUTES } from '@/features/purchases/constants'
import { usePurchase, useUpdatePurchase } from '@/features/purchases/hooks/use-purchases'
import type { PurchaseFormOutput } from '@/features/purchases/schemas/purchase.schema'
import { useAuth } from '@/hooks/useAuth'

function getUserDisplayName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function EditPurchasePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: purchase, isLoading, isError } = usePurchase(id)
  const updatePurchase = useUpdatePurchase()

  const handleSubmit = async (values: PurchaseFormOutput) => {
    if (!user) return
    await updatePurchase.mutateAsync({
      id,
      input: {
        ...values,
        userId: user.id,
        userName: getUserDisplayName(user),
      },
    })
    navigate(PURCHASE_ROUTES.DETAIL(id))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !purchase) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Purchase not found.</p>
        <Button asChild variant="outline">
          <Link to={PURCHASE_ROUTES.LIST}>Back to purchases</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PurchasePageHeader
        title={`Edit ${purchase.purchaseNumber}`}
        description="Update purchase details, items, and warehouse assignment."
        backTo={PURCHASE_ROUTES.DETAIL(id)}
        backLabel="Back to purchase details"
      />
      <PurchaseForm
        purchase={purchase}
        isSubmitting={updatePurchase.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
