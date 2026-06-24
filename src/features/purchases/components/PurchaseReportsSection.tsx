import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { PurchaseReports } from '@/features/purchases/types'
import { formatCurrency } from '@/lib/format'

interface PurchaseReportsSectionProps {
  reports?: PurchaseReports
  isLoading?: boolean
}

export function PurchaseReportsSection({ reports, isLoading }: PurchaseReportsSectionProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Total Purchases</span>
            <span className="font-semibold">{reports?.totalPurchases ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Purchase Value</span>
            <span className="font-semibold">{formatCurrency(reports?.totalPurchaseValue ?? 0)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Purchases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(reports?.monthly ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No monthly data yet.</p>
          ) : (
            reports?.monthly.map((entry) => (
              <div key={entry.month} className="flex justify-between text-sm">
                <span>{entry.month}</span>
                <span>
                  {entry.purchases} · {formatCurrency(entry.value)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchases By Supplier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(reports?.bySupplier ?? []).map((entry) => (
            <div key={entry.supplierId} className="flex justify-between text-sm">
              <span>{entry.supplierName}</span>
              <span>
                {entry.totalPurchases} · {formatCurrency(entry.totalAmount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchases By Warehouse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(reports?.byWarehouse ?? []).map((entry) => (
            <div key={entry.warehouseId} className="flex justify-between text-sm">
              <span>{entry.warehouseName}</span>
              <span>
                {entry.totalPurchases} · {formatCurrency(entry.totalAmount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
