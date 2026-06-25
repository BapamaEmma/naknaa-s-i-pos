import {
  AlertTriangle,
  Banknote,
  CalendarRange,
  Package,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardKpi } from '@/features/dashboard/types'

const iconMap: Record<string, LucideIcon> = {
  banknote: Banknote,
  'calendar-range': CalendarRange,
  'trending-up': TrendingUp,
  receipt: Receipt,
  users: Users,
  package: Package,
  warehouse: Warehouse,
  'alert-triangle': AlertTriangle,
}

const accentStyles = [
  {
    iconWrap: 'bg-violet-100 text-violet-600',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    iconWrap: 'bg-blue-100 text-blue-600',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    iconWrap: 'bg-cyan-100 text-cyan-600',
    gradient: 'from-cyan-400 to-sky-500',
  },
  {
    iconWrap: 'bg-emerald-100 text-emerald-600',
    gradient: 'from-emerald-400 to-green-600',
  },
  {
    iconWrap: 'bg-orange-100 text-orange-600',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    iconWrap: 'bg-rose-100 text-rose-600',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    iconWrap: 'bg-indigo-100 text-indigo-600',
    gradient: 'from-indigo-400 to-violet-600',
  },
  {
    iconWrap: 'bg-teal-100 text-teal-600',
    gradient: 'from-teal-400 to-emerald-500',
  },
]

interface DashboardStatsCardProps {
  kpi: DashboardKpi
  index?: number
}

export function DashboardStatsCard({ kpi, index = 0 }: DashboardStatsCardProps) {
  const Icon = iconMap[kpi.icon] ?? Banknote
  const TrendIcon = kpi.trend === 'down' ? TrendingDown : TrendingUp
  const accent = accentStyles[index % accentStyles.length]
  const trendLabel =
    kpi.trend === 'up' ? 'Than Last Period' : kpi.trend === 'down' ? 'Than Last Period' : 'No Change'
  const isEmptySalesMetric =
    kpi.value === 0 &&
    (kpi.id === 'today-sales' ||
      kpi.id === 'today-transactions' ||
      kpi.id === 'monthly-revenue')
  const emptyHint =
    kpi.id === 'today-sales' || kpi.id === 'today-transactions'
      ? 'No sales today'
      : kpi.id === 'monthly-revenue'
        ? 'No sales this month'
        : null

  return (
    <div className="dashboard-card relative overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div
        className={cn(
          'absolute right-4 top-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm',
          accent.iconWrap,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>

      <div className="pr-14">
        <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
        <p
          className={cn(
            'mt-1 text-xl font-bold leading-tight tracking-tight sm:text-2xl',
            isEmptySalesMetric ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {kpi.formattedValue}
        </p>
      </div>

      {isEmptySalesMetric && emptyHint ? (
        <p className="mt-4 pr-14 text-xs text-muted-foreground">{emptyHint}</p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 pr-14 text-xs">
          <TrendIcon
            className={cn(
              'h-3.5 w-3.5',
              kpi.trend === 'up' && 'text-emerald-600',
              kpi.trend === 'down' && 'text-red-500',
              kpi.trend === 'neutral' && 'text-muted-foreground',
            )}
          />
          <span
            className={cn(
              'font-semibold',
              kpi.trend === 'up' && 'text-emerald-600',
              kpi.trend === 'down' && 'text-red-500',
              kpi.trend === 'neutral' && 'text-muted-foreground',
            )}
          >
            {kpi.changePercent > 0 ? '+' : ''}
            {kpi.changePercent}%
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
