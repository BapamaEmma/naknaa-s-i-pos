import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DashboardStatsCard } from '@/features/dashboard/components/DashboardStatsCard'
import { PaymentMethodChart } from '@/features/dashboard/components/PaymentMethodChart'
import { RecentSalesTable } from '@/features/dashboard/components/RecentSalesTable'
import { SalesChart } from '@/features/dashboard/components/SalesChart'
import { StockSummaryCard } from '@/features/dashboard/components/StockSummaryCard'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { ROUTES } from '@/constants/routes'

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !data) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: string }).message ?? 'Unable to load dashboard data.')
          : 'Unable to load dashboard data.'

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">Dashboard unavailable</p>
          <p className="max-w-md text-sm text-muted-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">
            Make sure the backend API is running and you are signed in with a valid session.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Retrying...' : 'Try again'}
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.LOGIN}>Sign in again</Link>
          </Button>
        </div>
      </div>
    )
  }

  const primaryKpis = data.kpis.slice(0, 4)

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryKpis.map((kpi, index) => (
          <DashboardStatsCard key={kpi.id} kpi={kpi} index={index} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart data={data.salesChart} />
        </div>
        <PaymentMethodChart data={data.paymentMethods} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentSalesTable sales={data.recentSales} />
        </div>
        <StockSummaryCard overview={data.inventoryOverview} />
      </section>
    </div>
  )
}
