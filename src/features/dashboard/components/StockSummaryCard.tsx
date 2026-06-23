import { Link } from 'react-router-dom'
import { Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import type { InventoryOverview } from '@/features/dashboard/types'
import { formatCurrency, formatNumber } from '@/lib/format'

interface StockSummaryCardProps {
  overview: InventoryOverview
}

export function StockSummaryCard({ overview }: StockSummaryCardProps) {
  return (
    <div className="dashboard-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Stock History</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{formatNumber(overview.totalStockQuantity)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total sales items in stock</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Package className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-xl bg-muted/40 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Inventory value</span>
          <span className="font-semibold">{formatCurrency(overview.totalInventoryValue)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Low stock alerts</span>
          <span className="font-semibold text-amber-600">{overview.lowStockCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="font-semibold">+12.4%</span>
          <span className="text-muted-foreground">Than last month</span>
        </div>
      </div>

      <Button variant="outline" asChild className="mt-6 w-full sm:w-auto">
        <Link to={INVENTORY_ROUTES.DASHBOARD}>View Inventory</Link>
      </Button>
    </div>
  )
}
