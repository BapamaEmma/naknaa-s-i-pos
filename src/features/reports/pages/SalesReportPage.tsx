import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import { RevenueChart } from '@/features/reports/components/ReportCharts'
import type { ReportFilters } from '@/features/reports/types'
import { useSalesReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency, formatNumber } from '@/lib/format'

export function SalesReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('products')
  const { data, isLoading } = useSalesReport(filters)

  const exportRows = data?.byProduct ?? []

  return (
    <ReportPageLayout
      title="Sales Reports"
      description="Daily, weekly, monthly, and yearly sales performance with product, category, warehouse, payment, and cashier breakdowns."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showPeriod: true }}
      actions={
        <ExportButtons
          title="Sales Report"
          filename="sales-report"
          columns={[
            { header: 'Product', value: (row) => row.name },
            { header: 'Quantity', value: (row) => row.quantity },
            { header: 'Revenue', value: (row) => row.revenue },
          ]}
          rows={exportRows}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Revenue', value: data?.summary.revenue ?? 0, format: 'currency' },
          { label: 'Quantity Sold', value: data?.summary.quantitySold ?? 0, format: 'number' },
          { label: 'Transactions', value: data?.summary.transactions ?? 0, format: 'number' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart title="Daily Revenue Trend" data={data?.dailyTrend ?? []} />
        <RevenueChart title="Monthly Revenue Trend" data={data?.monthlyTrend ?? []} />
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'products', label: 'By Product' },
          { value: 'categories', label: 'By Category' },
          { value: 'warehouses', label: 'By Warehouse' },
          { value: 'payments', label: 'By Payment' },
          { value: 'cashiers', label: 'By Cashier' },
          { value: 'periods', label: 'By Period' },
        ]}
      />

      {tab === 'products' ? (
        <ReportTable
          title="Sales By Product"
          rows={data?.byProduct ?? []}
          columns={[
            { key: 'name', header: 'Product' },
            { key: 'quantity', header: 'Qty Sold', render: (row) => formatNumber(row.quantity) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}

      {tab === 'categories' ? (
        <ReportTable
          title="Sales By Category"
          rows={data?.byCategory ?? []}
          columns={[
            { key: 'name', header: 'Category' },
            { key: 'quantity', header: 'Qty Sold', render: (row) => formatNumber(row.quantity) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}

      {tab === 'warehouses' ? (
        <ReportTable
          title="Sales By Warehouse"
          rows={data?.byWarehouse ?? []}
          columns={[
            { key: 'name', header: 'Warehouse' },
            { key: 'quantity', header: 'Qty Sold', render: (row) => formatNumber(row.quantity) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}

      {tab === 'payments' ? (
        <ReportTable
          title="Sales By Payment Method"
          rows={data?.byPaymentMethod ?? []}
          columns={[
            { key: 'name', header: 'Payment Method' },
            { key: 'count', header: 'Transactions', render: (row) => formatNumber(row.count) },
            { key: 'value', header: 'Revenue', render: (row) => formatCurrency(row.value) },
          ]}
        />
      ) : null}

      {tab === 'cashiers' ? (
        <ReportTable
          title="Sales By Cashier"
          rows={data?.byCashier ?? []}
          columns={[
            { key: 'name', header: 'Cashier' },
            { key: 'transactions', header: 'Transactions', render: (row) => formatNumber(row.transactions) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}

      {tab === 'periods' ? (
        <ReportTable
          title="Monthly Sales Breakdown"
          rows={data?.periodBreakdown ?? []}
          columns={[
            { key: 'label', header: 'Period' },
            { key: 'transactions', header: 'Transactions', render: (row) => formatNumber(row.transactions) },
            { key: 'quantity', header: 'Qty Sold', render: (row) => formatNumber(row.quantity) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}
    </ReportPageLayout>
  )
}
