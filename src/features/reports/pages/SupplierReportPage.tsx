import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { SupplierChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters, ReportTableColumn, SupplierReportRow } from '@/features/reports/types'
import { useSupplierReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatDate, formatNumber } from '@/lib/format'

export function SupplierReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('purchase')
  const { data, isLoading } = useSupplierReport(filters)

  return (
    <ReportPageLayout
      title="Supplier Reports"
      description="Supplier purchase history, top suppliers, and supplier performance analysis."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showUser: false, showCategory: false }}
      actions={
        <ExportButtons
          title="Supplier Report"
          filename="supplier-report"
          columns={[
            { header: 'Supplier', value: (row) => row.supplierName },
            { header: 'Purchases', value: (row) => row.totalPurchases },
            { header: 'Quantity Supplied', value: (row) => row.totalQuantitySupplied },
            { header: 'Last Supply', value: (row) => row.lastSupplyDate ?? '' },
          ]}
          rows={data?.purchaseReport ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Suppliers', value: data?.summary.totalSuppliers ?? 0, format: 'number' },
          { label: 'Active Suppliers', value: data?.summary.activeSuppliers ?? 0, format: 'number' },
          { label: 'Total Purchase Value', value: data?.summary.totalPurchaseValue ?? 0, format: 'currency' },
          { label: 'Total Quantity', value: data?.summary.totalQuantity ?? 0, format: 'number' },
        ]}
      />

      <SupplierChart title="Supplier Performance" data={data?.performance ?? []} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'purchase', label: 'Purchase Report' },
          { value: 'top', label: 'Top Suppliers' },
          { value: 'performance', label: 'Performance' },
        ]}
      />

      {tab === 'purchase' || tab === 'top' ? (
        <ReportTable
          title={tab === 'top' ? 'Top Suppliers' : 'Supplier Purchase Report'}
          rows={tab === 'top' ? data?.topSuppliers ?? [] : data?.purchaseReport ?? []}
          columns={supplierColumns}
        />
      ) : null}

      {tab === 'performance' ? (
        <ReportTable
          title="Supplier Performance Report"
          rows={data?.purchaseReport ?? []}
          columns={[
            ...supplierColumns,
            {
              key: 'performanceScore',
              header: 'Score',
              render: (row: { performanceScore: number }) => `${row.performanceScore}/100`,
            },
          ]}
        />
      ) : null}
    </ReportPageLayout>
  )
}

const supplierColumns: ReportTableColumn<SupplierReportRow>[] = [
  { key: 'supplierName', header: 'Supplier Name' },
  { key: 'totalPurchases', header: 'Total Purchases', render: (row) => formatNumber(row.totalPurchases) },
  { key: 'totalQuantitySupplied', header: 'Qty Supplied', render: (row) => formatNumber(row.totalQuantitySupplied) },
  {
    key: 'lastSupplyDate',
    header: 'Last Supply Date',
    render: (row) => (row.lastSupplyDate ? formatDate(row.lastSupplyDate) : '—'),
  },
]
