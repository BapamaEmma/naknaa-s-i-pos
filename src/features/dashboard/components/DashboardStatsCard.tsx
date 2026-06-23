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

  return (
    <div className="dashboard-card flex flex-col justify-between p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
            {kpi.formattedValue}
          </p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm',
            accent.iconWrap,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs">
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
    </div>
  )
}
