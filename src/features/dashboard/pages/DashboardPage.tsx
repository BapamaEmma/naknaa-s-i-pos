import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BranchPerformanceChart } from '@/features/dashboard/components/BranchPerformanceChart'
import { DashboardStatsCard } from '@/features/dashboard/components/DashboardStatsCard'
import { InventoryOverviewCards } from '@/features/dashboard/components/InventoryOverviewCards'
import { LowStockTable } from '@/features/dashboard/components/LowStockTable'
import { NotificationPanel } from '@/features/dashboard/components/NotificationPanel'
import { PaymentMethodChart } from '@/features/dashboard/components/PaymentMethodChart'
import { QuickActionsCard } from '@/features/dashboard/components/QuickActionsCard'
import { RecentSalesTable } from '@/features/dashboard/components/RecentSalesTable'
import { SalesChart } from '@/features/dashboard/components/SalesChart'
import { TopProductsTable } from '@/features/dashboard/components/TopProductsTable'
import { WelcomeSection } from '@/features/dashboard/components/WelcomeSection'
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <WelcomeSection />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Key Performance Indicators</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.kpis.map((kpi) => (
            <DashboardStatsCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart data={data.salesChart} />
        </div>
        <PaymentMethodChart data={data.paymentMethods} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProductsTable products={data.topProducts} />
        </div>
        <QuickActionsCard />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LowStockTable items={data.lowStockItems} />
        <RecentSalesTable sales={data.recentSales} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Branch Performance</h2>
        <BranchPerformanceChart branches={data.branchPerformance} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Inventory Overview</h2>
        <InventoryOverviewCards overview={data.inventoryOverview} />
      </section>

      <section>
        <NotificationPanel notifications={data.notifications} />
      </section>
    </div>
  )
}
