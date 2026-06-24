import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SupplierAnalytics } from '@/features/suppliers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SupplierAnalyticsCardsProps {
  analytics: SupplierAnalytics
}

export function SupplierAnalyticsCards({ analytics }: SupplierAnalyticsCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Most Supplied Product</p>
            <p className="text-lg font-semibold">{analytics.mostSuppliedProduct}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Quantity Supplied</p>
            <p className="text-lg font-semibold">{analytics.totalQuantitySupplied}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Purchase Value</p>
            <p className="text-lg font-semibold">{formatCurrency(analytics.totalPurchaseValue)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Supplies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.recentSupplies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No supply records yet.</p>
          ) : (
            analytics.recentSupplies.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">
                    {entry.productName} · {entry.variantName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.quantitySupplied} units · {formatDate(entry.dateSupplied)}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(entry.totalCost)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
