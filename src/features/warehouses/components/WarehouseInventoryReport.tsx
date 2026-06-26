import { Boxes, Package, TrendingUp, Warehouse } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { WarehouseInventoryReportRow } from '@/features/warehouses/types'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

interface WarehouseInventoryReportProps {
  rows?: WarehouseInventoryReportRow[]
  isLoading?: boolean
}

const warehouseAccents = [
  'border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/20 dark:to-card',
  'border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-white dark:from-blue-950/20 dark:to-card',
  'border-cyan-200/80 bg-gradient-to-br from-cyan-50/90 to-white dark:from-cyan-950/20 dark:to-card',
  'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/20 dark:to-card',
  'border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/20 dark:to-card',
  'border-rose-200/80 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/20 dark:to-card',
]

const iconAccents = [
  'bg-violet-100 text-violet-600',
  'bg-blue-100 text-blue-600',
  'bg-cyan-100 text-cyan-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
]

export function WarehouseInventoryReport({ rows = [], isLoading }: WarehouseInventoryReportProps) {
  const totals = rows.reduce(
    (acc, row) => ({
      products: acc.products + row.totalProducts,
      quantity: acc.quantity + row.totalQuantity,
      value: acc.value + row.inventoryValue,
    }),
    { products: 0, quantity: 0, value: 0 },
  )

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="relative border-b border-border/50 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 p-5 sm:p-6 dark:from-slate-900/40 dark:via-card dark:to-slate-900/40">
        <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 sm:right-6 sm:top-6">
          <Warehouse className="h-5 w-5" aria-hidden />
        </div>

        <div className="pr-14">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Warehouse Inventory Report</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live stock levels and inventory value across all warehouse locations.
          </p>
        </div>

        {!isLoading && rows.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Warehouses</p>
              <p className="mt-1 text-xl font-bold">{formatNumber(rows.length)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Quantity</p>
              <p className="mt-1 text-xl font-bold">{formatNumber(totals.quantity)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Value</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(totals.value)}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <LoadingSpinner layout="inline" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
            <Boxes className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No warehouse inventory yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add stock to your warehouses to see inventory breakdown here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((row, index) => {
              const valueShare = totals.value > 0 ? (row.inventoryValue / totals.value) * 100 : 0

              return (
                <article
                  key={row.warehouseId}
                  className={cn(
                    'rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                    warehouseAccents[index % warehouseAccents.length],
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{row.warehouseName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatNumber(row.totalProducts)} product{row.totalProducts === 1 ? '' : 's'} tracked
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        iconAccents[index % iconAccents.length],
                      )}
                    >
                      <Package className="h-4 w-4" aria-hidden />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-background/70 px-3 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Quantity
                      </p>
                      <p className="mt-1 text-lg font-bold">{formatNumber(row.totalQuantity)}</p>
                    </div>
                    <div className="rounded-xl bg-background/70 px-3 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Value
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        {formatCurrency(row.inventoryValue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Share of total value</span>
                      <span className="font-medium text-foreground">{valueShare.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-background/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${valueShare > 0 ? Math.max(valueShare, 4) : 0}%` }}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {!isLoading && rows.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Combined inventory across all warehouses</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="text-muted-foreground">Products: </span>
              <span className="font-semibold">{formatNumber(totals.products)}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Quantity: </span>
              <span className="font-semibold">{formatNumber(totals.quantity)}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Value: </span>
              <span className="font-semibold text-emerald-600">{formatCurrency(totals.value)}</span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
