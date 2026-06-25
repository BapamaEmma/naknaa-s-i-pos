import { Package, RefreshCw, TrendingUp, Warehouse } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { WarehouseDashboardSummary } from '@/features/warehouses/types'
import { formatCurrency } from '@/lib/format'

interface WarehouseStatsCardsProps {
  summary?: WarehouseDashboardSummary
  isLoading?: boolean
}

export function WarehouseStatsCards({ summary, isLoading }: WarehouseStatsCardsProps) {
  if (isLoading) {
    return (
      <LoadingSpinner layout="cards" />
    )
  }

  const cards = [
    { title: 'Total Warehouses', value: summary?.totalWarehouses ?? 0, icon: Warehouse },
    { title: 'Total Inventory Quantity', value: summary?.totalInventoryQuantity ?? 0, icon: Package },
    { title: 'Total Inventory Value', value: formatCurrency(summary?.totalInventoryValue ?? 0), icon: TrendingUp },
    { title: 'Low Stock Items', value: summary?.lowStockItems ?? 0, icon: Package },
    { title: 'Transfers This Month', value: summary?.transfersThisMonth ?? 0, icon: RefreshCw },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
