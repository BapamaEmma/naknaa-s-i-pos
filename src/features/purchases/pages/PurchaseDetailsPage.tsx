import { Link, useParams } from 'react-router-dom'
import { PackageCheck, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PurchaseItemsTable } from '@/features/purchases/components/PurchaseItemsTable'
import { PurchasePageHeader } from '@/features/purchases/components/PurchasePageHeader'
import {
  PAYMENT_STATUS_LABELS,
  PURCHASE_ROUTES,
  PURCHASE_STATUS_LABELS,
} from '@/features/purchases/constants'
import { usePurchase } from '@/features/purchases/hooks/use-purchases'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'
import { formatCurrency, formatDate } from '@/lib/format'

export function PurchaseDetailsPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const canReceive = hasRole([USER_ROLES.ADMIN, USER_ROLES.CASHIER])
  const { data: purchase, isLoading, isError } = usePurchase(id)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
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
        title={purchase.purchaseNumber}
        description={`${purchase.supplierName} · ${purchase.warehouseName}`}
        backTo={PURCHASE_ROUTES.LIST}
        backLabel="Back to purchases"
        action={
          <div className="flex flex-wrap gap-2">
            {canReceive &&
            (purchase.purchaseStatus === 'ordered' ||
              purchase.purchaseStatus === 'partially_received') ? (
              <Button variant="outline" asChild>
                <Link to={`${PURCHASE_ROUTES.RECEIVE}?purchaseId=${purchase.id}`}>
                  <PackageCheck className="h-4 w-4" />
                  Receive Stock
                </Link>
              </Button>
            ) : null}
            {canManage ? (
              <Button asChild>
                <Link to={PURCHASE_ROUTES.EDIT(purchase.id)}>
                  <Pencil className="h-4 w-4" />
                  Edit Purchase
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Purchase Number</p>
              <p className="font-medium">{purchase.purchaseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purchase Date</p>
              <p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{purchase.invoiceNumber || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{purchase.createdByName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier & Warehouse</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{purchase.supplierName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warehouse</p>
              <p className="font-medium">{purchase.warehouseName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(purchase.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(purchase.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total Amount</span>
              <span>{formatCurrency(purchase.totalAmount)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge variant="secondary">{PAYMENT_STATUS_LABELS[purchase.paymentStatus]}</Badge>
              <Badge variant="default">{PURCHASE_STATUS_LABELS[purchase.purchaseStatus]}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Receiving Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseItemsTable items={purchase.items} showReceiving />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products Purchased</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseItemsTable items={purchase.items} showReceiving />
          {purchase.notes ? (
            <p className="mt-4 text-sm text-muted-foreground">Notes: {purchase.notes}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
