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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface DashboardStatsCardProps {
  kpi: DashboardKpi
}

export function DashboardStatsCard({ kpi }: DashboardStatsCardProps) {
  const Icon = iconMap[kpi.icon] ?? Banknote
  const TrendIcon = kpi.trend === 'down' ? TrendingDown : TrendingUp

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{kpi.formattedValue}</p>
        <div className="mt-2 flex items-center gap-1 text-xs">
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
              'font-medium',
              kpi.trend === 'up' && 'text-emerald-600',
              kpi.trend === 'down' && 'text-red-500',
              kpi.trend === 'neutral' && 'text-muted-foreground',
            )}
          >
            {kpi.changePercent > 0 ? '+' : ''}
            {kpi.changePercent}%
          </span>
          <span className="text-muted-foreground">vs previous period</span>
        </div>
      </CardContent>
    </Card>
  )
}
