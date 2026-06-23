import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DashboardStatsCard } from '@/features/dashboard/components/DashboardStatsCard'
import { PaymentMethodChart } from '@/features/dashboard/components/PaymentMethodChart'
import { RecentSalesTable } from '@/features/dashboard/components/RecentSalesTable'
import { SalesChart } from '@/features/dashboard/components/SalesChart'
import { StockSummaryCard } from '@/features/dashboard/components/StockSummaryCard'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'

export function DashboardPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <LoadingSpinner size="lg" />
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
