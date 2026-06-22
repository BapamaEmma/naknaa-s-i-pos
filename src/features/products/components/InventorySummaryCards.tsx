import { Package, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { InventorySummary } from '@/features/products/types'

interface InventorySummaryCardsProps {
  summary: InventorySummary
}

export function InventorySummaryCards({ summary }: InventorySummaryCardsProps) {
  const cards = [
    {
      title: 'Total Stock',
      value: summary.totalStock.toLocaleString(),
      icon: Package,
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(summary.inventoryValue),
      icon: Wallet,
    },
    {
      title: 'Low Stock Variants',
      value: summary.lowStockVariants.toLocaleString(),
      icon: TrendingDown,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
