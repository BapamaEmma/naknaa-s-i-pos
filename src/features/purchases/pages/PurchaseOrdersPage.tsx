import { PurchaseOrderTable } from '@/features/purchases/components/PurchaseOrderTable'
import { PurchasePageHeader } from '@/features/purchases/components/PurchasePageHeader'
import { PURCHASE_ROUTES } from '@/features/purchases/constants'
import { usePurchaseOrders } from '@/features/purchases/hooks/use-purchases'

export function PurchaseOrdersPage() {
  const { data: orders = [], isLoading } = usePurchaseOrders()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PurchasePageHeader
        title="Purchase Orders"
        description="Create and manage purchase orders before converting to purchases."
        backTo={PURCHASE_ROUTES.LIST}
        backLabel="Back to purchases"
      />
      <PurchaseOrderTable orders={orders} isLoading={isLoading} />
    </div>
  )
}
