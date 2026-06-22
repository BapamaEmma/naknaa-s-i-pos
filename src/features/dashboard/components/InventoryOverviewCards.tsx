import { AlertTriangle, Boxes, PackageX, Warehouse } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryOverview } from '@/features/dashboard/types'
import { formatCurrency, formatNumber } from '@/lib/format'

interface InventoryOverviewCardsProps {
  overview: InventoryOverview
}

export function InventoryOverviewCards({ overview }: InventoryOverviewCardsProps) {
  const cards = [
    {
      title: 'Total Inventory Value',
      value: formatCurrency(overview.totalInventoryValue),
      icon: Warehouse,
    },
    {
      title: 'Total Stock Quantity',
      value: formatNumber(overview.totalStockQuantity),
      icon: Boxes,
    },
    {
      title: 'Low Stock Count',
      value: formatNumber(overview.lowStockCount),
      icon: AlertTriangle,
    },
    {
      title: 'Out Of Stock Count',
      value: formatNumber(overview.outOfStockCount),
      icon: PackageX,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
        <Card key={title} className="shadow-sm">
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
