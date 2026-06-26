import { CheckCircle2, Clock, Layers, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { ServiceDashboardSummary } from '@/features/services/types'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ServiceStatsCardsProps {
  summary?: ServiceDashboardSummary
  isLoading?: boolean
  compact?: boolean
}

export function ServiceStatsCards({ summary, isLoading, compact }: ServiceStatsCardsProps) {
  if (isLoading) {
    return (
      <LoadingSpinner layout="cards" />
    )
  }

  const cards = [
    { title: 'Total Services', value: summary?.totalServices ?? 0, icon: Layers },
    { title: 'Completed Services', value: summary?.completedJobs ?? 0, icon: CheckCircle2 },
    { title: 'Pending Services', value: summary?.pendingJobs ?? 0, icon: Clock },
    { title: 'Service Revenue', value: formatCurrency(summary?.serviceRevenue ?? 0), icon: Wallet },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader
            className={cn(
              'flex flex-row items-center justify-between space-y-0',
              compact ? 'pb-1 pt-4' : 'pb-2',
            )}
          >
            <CardTitle className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
              {card.title}
            </CardTitle>
            <card.icon className={cn('text-muted-foreground', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          </CardHeader>
          <CardContent className={compact ? 'pb-4 pt-0' : undefined}>
            <p className={cn('font-bold', compact ? 'text-xl' : 'text-2xl')}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
