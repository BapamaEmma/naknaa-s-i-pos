import { CalendarDays, Receipt, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CustomerStats } from '@/features/customers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface CustomerStatsCardsProps {
  stats: CustomerStats
}

export function CustomerStatsCards({ stats }: CustomerStatsCardsProps) {
  const cards = [
    {
      title: 'Total Purchases',
      value: String(stats.totalPurchases),
      icon: ShoppingBag,
    },
    {
      title: 'Total Amount Spent',
      value: formatCurrency(stats.totalAmountSpent),
      icon: Receipt,
    },
    {
      title: 'Last Purchase Date',
      value: stats.lastPurchaseDate ? formatDate(stats.lastPurchaseDate) : '—',
      icon: CalendarDays,
    },
    {
      title: 'Average Purchase Value',
      value: formatCurrency(stats.averagePurchaseValue),
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
