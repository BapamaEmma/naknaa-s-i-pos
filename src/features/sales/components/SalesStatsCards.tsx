import { Banknote, CalendarDays, Receipt, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { SalesDashboardSummary } from '@/features/sales/types'
import { formatCurrency } from '@/lib/format'

interface SalesStatsCardsProps {
  summary?: SalesDashboardSummary
  isLoading?: boolean
}

const cards = [
  {
    key: 'todaySales' as const,
    title: "Today's Sales",
    icon: Banknote,
    format: (value: number) => formatCurrency(value),
  },
  {
    key: 'todayTransactions' as const,
    title: "Today's Transactions",
    icon: Receipt,
    format: (value: number) => String(value),
  },
  {
    key: 'weeklyRevenue' as const,
    title: 'Weekly Revenue',
    icon: CalendarDays,
    format: (value: number) => formatCurrency(value),
  },
  {
    key: 'monthlyRevenue' as const,
    title: 'Monthly Revenue',
    icon: TrendingUp,
    format: (value: number) => formatCurrency(value),
  },
]

export function SalesStatsCards({ summary, isLoading }: SalesStatsCardsProps) {
  if (isLoading) {
    return (
      <LoadingSpinner layout="cards" />
    )
  }

  const stats = summary ?? {
    todaySales: 0,
    todayTransactions: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, title, icon: Icon, format }) => {
        const value = stats[key]
        const isEmpty = value === 0

        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${isEmpty ? 'text-muted-foreground' : ''}`}>
                {format(value)}
              </p>
              {isEmpty ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {key === 'todaySales' || key === 'todayTransactions'
                    ? 'No sales today'
                    : key === 'weeklyRevenue'
                      ? 'No sales this week'
                      : 'No sales this month'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
