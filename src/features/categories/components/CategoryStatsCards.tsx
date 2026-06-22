import { Package, PackageCheck, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryStatistics } from '@/features/categories/types'

interface CategoryStatsCardsProps {
  statistics: CategoryStatistics
}

export function CategoryStatsCards({ statistics }: CategoryStatsCardsProps) {
  const cards = [
    { title: 'Total Products', value: statistics.totalProducts, icon: Package },
    { title: 'Active Products', value: statistics.activeProducts, icon: PackageCheck },
    { title: 'Low Stock Products', value: statistics.lowStockProducts, icon: TrendingDown },
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
