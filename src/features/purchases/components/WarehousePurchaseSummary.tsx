import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { WarehousePurchaseSummaryItem } from '@/features/purchases/types'
import { formatCurrency } from '@/lib/format'

interface WarehousePurchaseSummaryProps {
  items: WarehousePurchaseSummaryItem[]
  isLoading?: boolean
}

export function WarehousePurchaseSummary({ items, isLoading }: WarehousePurchaseSummaryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.warehouseId}>
          <CardHeader>
            <CardTitle className="text-base">{item.warehouseName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Products Received</span>
              <span className="font-medium">{item.productsReceived}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inventory Value</span>
              <span className="font-medium">{formatCurrency(item.inventoryValue)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
