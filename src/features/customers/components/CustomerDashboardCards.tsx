import { CalendarDays, Crown, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { CustomerDashboardSummary } from '@/features/customers/types'
import { formatCurrency } from '@/lib/format'

interface CustomerDashboardCardsProps {
  summary?: CustomerDashboardSummary
  isLoading?: boolean
}

export function CustomerDashboardCards({ summary, isLoading }: CustomerDashboardCardsProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const topSpender = summary?.highestSpendingCustomers[0]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary?.totalCustomers ?? 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary?.newCustomersThisMonth ?? 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Customer</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold">{summary?.topCustomers[0]?.fullName ?? '—'}</p>
          <p className="text-xs text-muted-foreground">
            {summary?.topCustomers[0]?.totalPurchases ?? 0} purchases
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Spending</CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold">{topSpender?.fullName ?? '—'}</p>
          <p className="text-xs text-muted-foreground">
            {topSpender ? formatCurrency(topSpender.totalAmountSpent) : '—'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
