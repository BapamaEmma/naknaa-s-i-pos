import { AlertTriangle, Boxes, Package, PackageX, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { InventoryDashboardSummary } from '@/features/inventory/types'

interface InventoryStatsCardsProps {
  summary: InventoryDashboardSummary
}

export function InventoryStatsCards({ summary }: InventoryStatsCardsProps) {
  const cards = [
    { title: 'Total Products', value: summary.totalProducts.toLocaleString(), icon: Package },
    {
      title: 'Total Stock Quantity',
      value: summary.totalStockQuantity.toLocaleString(),
      icon: Boxes,
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(summary.inventoryValue),
      icon: Wallet,
    },
    {
      title: 'Low Stock Products',
      value: summary.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
    },
    {
      title: 'Out Of Stock Products',
      value: summary.outOfStockProducts.toLocaleString(),
      icon: PackageX,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
