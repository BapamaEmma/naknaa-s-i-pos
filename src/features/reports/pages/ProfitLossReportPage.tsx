import { useState } from 'react'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { PerformanceBarChart, RevenueChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters } from '@/features/reports/types'
import { useProfitLossReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency } from '@/lib/format'

export function ProfitLossReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const { data, isLoading } = useProfitLossReport(filters)

  return (
    <ReportPageLayout
      title="Profit & Loss Report"
      description="Estimated profit calculated from revenue minus purchase and service costs."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showWarehouse: false, showCategory: false, showUser: false }}
      actions={
        <ExportButtons
          title="Profit & Loss Report"
          filename="profit-loss-report"
          columns={[
            { header: 'Metric', value: (row) => row.label },
            { header: 'Amount', value: (row) => row.value },
          ]}
          rows={[
            { label: 'Total Revenue', value: data?.totalRevenue ?? 0 },
            { label: 'Purchase Costs', value: data?.purchaseCosts ?? 0 },
            { label: 'Service Costs', value: data?.serviceCosts ?? 0 },
            { label: 'Total Expenses', value: data?.totalExpenses ?? 0 },
            { label: 'Gross Profit', value: data?.grossProfit ?? 0 },
            { label: 'Net Profit', value: data?.netProfit ?? 0 },
          ]}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Revenue', value: data?.totalRevenue ?? 0, format: 'currency' },
          { label: 'Total Expenses', value: data?.totalExpenses ?? 0, format: 'currency' },
          { label: 'Gross Profit', value: data?.grossProfit ?? 0, format: 'currency' },
          { label: 'Net Profit', value: data?.netProfit ?? 0, format: 'currency' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PerformanceBarChart
          title="Revenue Breakdown"
          data={(data?.revenueBreakdown ?? []).map((entry) => ({ label: entry.label, value: entry.value }))}
          name="Revenue"
        />
        <PerformanceBarChart
          title="Expense Breakdown"
          data={(data?.expenseBreakdown ?? []).map((entry) => ({ label: entry.label, value: entry.value }))}
          name="Expenses"
        />
      </div>

      <RevenueChart title="Monthly Profit Trend" data={data?.monthlyTrend ?? []} />

      <ReportTable
        title="Profit & Loss Summary"
        rows={[
          { label: 'Total Revenue', value: data?.totalRevenue ?? 0 },
          { label: 'Purchase Costs', value: data?.purchaseCosts ?? 0 },
          { label: 'Service Costs', value: data?.serviceCosts ?? 0 },
          { label: 'Total Expenses', value: data?.totalExpenses ?? 0 },
          { label: 'Gross Profit', value: data?.grossProfit ?? 0 },
          { label: 'Net Profit', value: data?.netProfit ?? 0 },
        ]}
        columns={[
          { key: 'label', header: 'Metric' },
          { key: 'value', header: 'Amount', render: (row) => formatCurrency(row.value) },
        ]}
      />
    </ReportPageLayout>
  )
}
