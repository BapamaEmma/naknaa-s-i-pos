import { AlertTriangle, Boxes, Package, PackageX, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { InventoryDashboardSummary } from '@/features/inventory/types'
import { cn } from '@/lib/utils'

interface InventoryStatsCardsProps {
  summary: InventoryDashboardSummary
}

interface StatCardConfig {
  title: string
  value: string
  icon: typeof Package
  tone?: 'default' | 'warning' | 'danger'
}

function StatCard({ title, value, icon: Icon, tone = 'default' }: StatCardConfig) {
  return (
    <Card
      className={cn(
        tone === 'warning' && 'border-amber-200 bg-amber-50/40',
        tone === 'danger' && 'border-destructive/30 bg-destructive/5',
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={cn(
            'h-4 w-4',
            tone === 'warning' && 'text-amber-600',
            tone === 'danger' && 'text-destructive',
            tone === 'default' && 'text-muted-foreground',
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

export function InventoryStatsCards({ summary }: InventoryStatsCardsProps) {
  const alertCards: StatCardConfig[] = [
    {
      title: 'Low Stock Products',
      value: summary.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      tone: 'warning',
    },
    {
      title: 'Out Of Stock Products',
      value: summary.outOfStockProducts.toLocaleString(),
      icon: PackageX,
      tone: 'danger',
    },
  ]

  const overviewCards: StatCardConfig[] = [
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
  ]

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Stock Alerts</h2>
          <p className="text-sm text-muted-foreground">Items that need attention right away.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {alertCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">Current inventory totals across all branches.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overviewCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </div>
  )
}
