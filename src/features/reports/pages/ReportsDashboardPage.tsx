import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ReportFilters } from '@/features/reports/components/ReportFilters'
import { ReportNavCards } from '@/features/reports/components/ReportNavCards'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { RevenueChart } from '@/features/reports/components/ReportCharts'
import type { ReportFilters as ReportFiltersType } from '@/features/reports/types'
import { useReportsDashboard, useSalesReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency } from '@/lib/format'

export function ReportsDashboardPage() {
  const [filters, setFilters] = useState<ReportFiltersType>(reportFilterDefaults)
  const { data: dashboard, isLoading } = useReportsDashboard(filters)
  const { data: sales } = useSalesReport(filters)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Business intelligence across sales, inventory, purchases, warehouses, customers, suppliers, services, and users."
      />

      <ReportFilters value={filters} onChange={setFilters} showUser={false} />

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <LoadingSpinner layout="inline" />
        </div>
      ) : (
        <>
          <ReportSummaryCards
            items={[
              { label: 'Total Revenue', value: dashboard?.totalRevenue ?? 0, format: 'currency' },
              { label: 'Total Purchases', value: dashboard?.totalPurchases ?? 0, format: 'currency' },
              { label: 'Inventory Value', value: dashboard?.inventoryValue ?? 0, format: 'currency' },
              { label: 'Total Customers', value: dashboard?.totalCustomers ?? 0, format: 'number' },
              { label: 'Total Suppliers', value: dashboard?.totalSuppliers ?? 0, format: 'number' },
              { label: 'Total Services', value: dashboard?.totalServices ?? 0, format: 'number' },
              { label: 'Monthly Profit', value: dashboard?.monthlyProfit ?? 0, format: 'currency' },
              { label: 'Monthly Transactions', value: dashboard?.monthlyTransactions ?? 0, format: 'number' },
            ]}
          />

          <RevenueChart
            title="Monthly Revenue Trend"
            description={`Current revenue total: ${formatCurrency(dashboard?.totalRevenue ?? 0)}`}
            data={sales?.monthlyTrend ?? []}
          />

          <ReportNavCards />
        </>
      )}
    </div>
  )
}
