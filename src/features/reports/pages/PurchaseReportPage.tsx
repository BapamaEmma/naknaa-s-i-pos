import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { PurchaseChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters } from '@/features/reports/types'
import { usePurchaseReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'

export function PurchaseReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('suppliers')
  const { data, isLoading } = usePurchaseReport(filters)

  return (
    <ReportPageLayout
      title="Purchase Reports"
      description="Purchases by supplier and warehouse, monthly purchase trends, and cost analysis."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showUser: false, showCategory: false }}
      actions={
        <ExportButtons
          title="Purchase Report"
          filename="purchase-report"
          columns={[
            { header: 'Supplier', value: (row) => row.supplierName },
            { header: 'Product', value: (row) => row.productName },
            { header: 'Quantity', value: (row) => row.quantityPurchased },
            { header: 'Total Cost', value: (row) => row.totalCost },
          ]}
          rows={data?.rows ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Purchases', value: data?.summary.totalPurchases ?? 0, format: 'number' },
          { label: 'Total Cost', value: data?.summary.totalCost ?? 0, format: 'currency' },
          { label: 'Total Quantity', value: data?.summary.totalQuantity ?? 0, format: 'number' },
        ]}
      />

      <PurchaseChart title="Monthly Purchases" data={data?.monthly ?? []} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'suppliers', label: 'By Supplier' },
          { value: 'warehouses', label: 'By Warehouse' },
          { value: 'analysis', label: 'Cost Analysis' },
          { value: 'details', label: 'Purchase Details' },
        ]}
      />

      {tab === 'suppliers' ? (
        <ReportTable
          title="Purchases By Supplier"
          rows={data?.bySupplier ?? []}
          columns={[
            { key: 'supplierName', header: 'Supplier' },
            { key: 'purchases', header: 'Purchases', render: (row) => formatNumber(row.purchases) },
            { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
            { key: 'totalCost', header: 'Total Cost', render: (row) => formatCurrency(row.totalCost) },
          ]}
        />
      ) : null}

      {tab === 'warehouses' ? (
        <ReportTable
          title="Purchases By Warehouse"
          rows={data?.byWarehouse ?? []}
          columns={[
            { key: 'warehouseName', header: 'Warehouse' },
            { key: 'purchases', header: 'Purchases', render: (row) => formatNumber(row.purchases) },
            { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
            { key: 'totalCost', header: 'Total Cost', render: (row) => formatCurrency(row.totalCost) },
          ]}
        />
      ) : null}

      {tab === 'analysis' ? (
        <ReportTable
          title="Purchase Cost Analysis"
          rows={data?.costAnalysis ?? []}
          columns={[
            { key: 'label', header: 'Supplier' },
            { key: 'cost', header: 'Cost', render: (row) => formatCurrency(row.cost) },
            { key: 'share', header: 'Share %', render: (row) => `${row.share}%` },
          ]}
        />
      ) : null}

      {tab === 'details' ? (
        <ReportTable
          title="Purchase Details"
          rows={data?.rows ?? []}
          columns={[
            { key: 'supplierName', header: 'Supplier' },
            { key: 'productName', header: 'Product' },
            { key: 'quantityPurchased', header: 'Quantity', render: (row) => formatNumber(row.quantityPurchased) },
            { key: 'totalCost', header: 'Total Cost', render: (row) => formatCurrency(row.totalCost) },
            { key: 'purchaseDate', header: 'Date', render: (row) => (row.purchaseDate ? formatDate(row.purchaseDate) : '—') },
          ]}
        />
      ) : null}
    </ReportPageLayout>
  )
}
