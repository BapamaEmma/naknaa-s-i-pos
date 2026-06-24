import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import type { InventoryOverview } from '@/features/dashboard/types'
import { formatCurrency, formatNumber } from '@/lib/format'

interface StockSummaryCardProps {
  overview: InventoryOverview
}

export function StockSummaryCard({ overview }: StockSummaryCardProps) {
  return (
    <div className="dashboard-card relative flex h-full flex-col overflow-hidden p-5">
      <div className="absolute right-4 top-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
        <Package className="h-5 w-5" aria-hidden />
      </div>

      <div className="pr-14">
        <p className="text-sm font-medium text-muted-foreground">Stock History</p>
        <p className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {formatNumber(overview.totalStockQuantity)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Total sales items in stock</p>
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
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Out of stock</span>
          <span className="font-semibold text-red-600">{overview.outOfStockCount}</span>
        </div>
      </div>

      <Button variant="outline" asChild className="mt-6 w-full sm:w-auto">
        <Link to={INVENTORY_ROUTES.DASHBOARD}>View Inventory</Link>
      </Button>
    </div>
  )
}
