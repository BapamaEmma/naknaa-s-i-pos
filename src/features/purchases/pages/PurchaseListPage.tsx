import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, PackageCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PurchaseDeleteDialog } from '@/features/purchases/components/PurchaseDeleteDialog'
import { PurchaseFilters } from '@/features/purchases/components/PurchaseFilters'
import { PurchasePageHeader } from '@/features/purchases/components/PurchasePageHeader'
import { PurchaseReportsSection } from '@/features/purchases/components/PurchaseReportsSection'
import { PurchaseStatsCards } from '@/features/purchases/components/PurchaseStatsCards'
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable'
import { SupplierPurchaseHistory } from '@/features/purchases/components/SupplierPurchaseHistory'
import { WarehousePurchaseSummary } from '@/features/purchases/components/WarehousePurchaseSummary'
import { PURCHASE_ROUTES } from '@/features/purchases/constants'
import {
  usePurchaseDashboard,
  usePurchaseReports,
  usePurchases,
  useSupplierPurchaseHistory,
  useWarehousePurchaseSummary,
} from '@/features/purchases/hooks/use-purchases'
import type { PurchaseListFilters, PurchaseListItem } from '@/features/purchases/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function PurchaseListPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const canReceive = hasRole([USER_ROLES.ADMIN, USER_ROLES.CASHIER])

  const [filters, setFilters] = useState<PurchaseListFilters>({
    page: 1,
    limit: 10,
    warehouseId: 'all',
    purchaseStatus: 'all',
    paymentStatus: 'all',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseListItem | null>(null)

  const { data: dashboard, isLoading: dashboardLoading } = usePurchaseDashboard()
  const { data: reports, isLoading: reportsLoading } = usePurchaseReports()
  const { data, isLoading } = usePurchases(filters)
  const { data: supplierHistory = [], isLoading: supplierHistoryLoading } = useSupplierPurchaseHistory()
  const { data: warehouseSummary = [], isLoading: warehouseSummaryLoading } = useWarehousePurchaseSummary()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PurchasePageHeader
        title="Purchases"
        description="Record supplier purchases, receive inventory, and track purchase costs."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={PURCHASE_ROUTES.ORDERS}>
                <ClipboardList className="h-4 w-4" />
                Orders
              </Link>
            </Button>
            {canReceive ? (
              <Button variant="outline" asChild>
                <Link to={PURCHASE_ROUTES.RECEIVE}>
                  <PackageCheck className="h-4 w-4" />
                  Receive Stock
                </Link>
              </Button>
            ) : null}
            {canManage ? (
              <Button asChild>
                <Link to={PURCHASE_ROUTES.CREATE}>
                  <Plus className="h-4 w-4" />
                  New Purchase
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <PurchaseStatsCards summary={dashboard} isLoading={dashboardLoading} />
      <PurchaseFilters filters={filters} onChange={setFilters} />
      <PurchaseTable
        data={data}
        isLoading={isLoading}
        canManage={canManage}
        canReceive={canReceive}
        onDelete={(purchase) => {
          setSelectedPurchase(purchase)
          setDeleteOpen(true)
        }}
      />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} purchases
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <PurchaseReportsSection reports={reports} isLoading={reportsLoading} />

      <Card>
        <CardHeader>
          <CardTitle>Supplier Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierPurchaseHistory items={supplierHistory} isLoading={supplierHistoryLoading} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Warehouse Purchase Summary</h2>
          <p className="text-sm text-muted-foreground">
            Products received and inventory value by warehouse.
          </p>
        </div>
        <WarehousePurchaseSummary items={warehouseSummary} isLoading={warehouseSummaryLoading} />
      </section>

      <PurchaseDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        purchase={selectedPurchase}
      />
    </div>
  )
}
