import { CalendarDays, Package, ShoppingBag, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SupplierStatistics } from '@/features/suppliers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SupplierStatsCardsProps {
  stats: SupplierStatistics
}

export function SupplierStatsCards({ stats }: SupplierStatsCardsProps) {
  const cards = [
    {
      title: 'Total Products Supplied',
      value: stats.totalProductsSupplied,
      icon: Package,
    },
    {
      title: 'Total Quantity Supplied',
      value: stats.totalQuantitySupplied,
      icon: ShoppingBag,
    },
    {
      title: 'Total Purchase Value',
      value: formatCurrency(stats.totalPurchaseValue),
      icon: Wallet,
    },
    {
      title: 'Last Supply Date',
      value: stats.lastSupplyDate ? formatDate(stats.lastSupplyDate) : '—',
      icon: CalendarDays,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
