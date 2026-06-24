import { CheckCircle2, Clock, Package, Receipt, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { PurchaseDashboardSummary } from '@/features/purchases/types'
import { formatCurrency } from '@/lib/format'

interface PurchaseStatsCardsProps {
  summary?: PurchaseDashboardSummary
  isLoading?: boolean
}

export function PurchaseStatsCards({ summary, isLoading }: PurchaseStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const cards = [
    { title: 'Total Purchases', value: summary?.totalPurchases ?? 0, icon: Package },
    { title: 'Purchase Value', value: formatCurrency(summary?.purchaseValue ?? 0), icon: Wallet },
    { title: 'Pending Purchases', value: summary?.pendingPurchases ?? 0, icon: Clock },
    { title: 'Received Purchases', value: summary?.receivedPurchases ?? 0, icon: CheckCircle2 },
    { title: 'Unpaid Purchases', value: summary?.unpaidPurchases ?? 0, icon: Receipt },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
