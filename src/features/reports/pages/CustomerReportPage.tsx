import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { CustomerChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters } from '@/features/reports/types'
import { useCustomerReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'

export function CustomerReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('top')
  const { data, isLoading } = useCustomerReport(filters)

  return (
    <ReportPageLayout
      title="Customer Reports"
      description="Customer purchase history, top customers, spending analysis, and purchase frequency."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showWarehouse: false, showCategory: false }}
      actions={
        <ExportButtons
          title="Customer Report"
          filename="customer-report"
          columns={[
            { header: 'Customer', value: (row) => row.customerName },
            { header: 'Purchases', value: (row) => row.purchases },
            { header: 'Amount Spent', value: (row) => row.amountSpent },
            { header: 'Last Purchase', value: (row) => row.lastPurchaseDate ?? '' },
          ]}
          rows={data?.topCustomers ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Customers', value: data?.summary.totalCustomers ?? 0, format: 'number' },
          { label: 'Active Customers', value: data?.summary.activeCustomers ?? 0, format: 'number' },
          { label: 'Average Spend', value: data?.summary.averageSpend ?? 0, format: 'currency' },
          { label: 'Total Spent', value: data?.summary.totalSpent ?? 0, format: 'currency' },
        ]}
      />

      <CustomerChart title="Customer Spending Analysis" data={data?.spendingAnalysis ?? []} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'top', label: 'Top Customers' },
          { value: 'history', label: 'Purchase History' },
          { value: 'frequency', label: 'Frequency Analysis' },
        ]}
      />

      {tab === 'top' ? (
        <ReportTable title="Top Customers" rows={data?.topCustomers ?? []} columns={customerColumns} />
      ) : null}

      {tab === 'history' ? (
        <ReportTable title="Customer Purchase History" rows={data?.purchaseHistory ?? []} columns={customerColumns} />
      ) : null}

      {tab === 'frequency' ? (
        <ReportTable
          title="Customer Frequency Analysis"
          rows={data?.frequencyAnalysis ?? []}
          columns={[
            { key: 'label', header: 'Frequency' },
            { key: 'customers', header: 'Customers', render: (row) => formatNumber(row.customers) },
          ]}
        />
      ) : null}
    </ReportPageLayout>
  )
}

const customerColumns = [
  { key: 'customerName', header: 'Customer Name' },
  { key: 'purchases', header: 'Purchases', render: (row: { purchases: number }) => formatNumber(row.purchases) },
  { key: 'amountSpent', header: 'Amount Spent', render: (row: { amountSpent: number }) => formatCurrency(row.amountSpent) },
  {
    key: 'lastPurchaseDate',
    header: 'Last Purchase',
    render: (row: { lastPurchaseDate: string | null }) =>
      row.lastPurchaseDate ? formatDate(row.lastPurchaseDate) : '—',
  },
] as const
