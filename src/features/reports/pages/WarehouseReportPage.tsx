import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { WarehouseChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters } from '@/features/reports/types'
import { useWarehouseReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency, formatNumber } from '@/lib/format'

export function WarehouseReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('stock')
  const { data, isLoading } = useWarehouseReport(filters)

  return (
    <ReportPageLayout
      title="Warehouse Reports"
      description="Stock, transfer, and inventory value reports for Chairman Down, Chairman Top, Nasoo, and Masalachi."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showUser: false, showCategory: false }}
      actions={
        <ExportButtons
          title="Warehouse Report"
          filename="warehouse-report"
          columns={[
            { header: 'Warehouse', value: (row) => row.warehouseName },
            { header: 'Stock Quantity', value: (row) => row.stockQuantity },
            { header: 'Inventory Value', value: (row) => row.inventoryValue },
            { header: 'Product Count', value: (row) => row.productCount },
          ]}
          rows={data?.stockReport ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Stock', value: data?.summary.totalStock ?? 0, format: 'number' },
          { label: 'Inventory Value', value: data?.summary.totalValue ?? 0, format: 'currency' },
          { label: 'Product Count', value: data?.summary.totalProducts ?? 0, format: 'number' },
          { label: 'Transfers This Month', value: data?.summary.transfersThisMonth ?? 0, format: 'number' },
        ]}
      />

      <WarehouseChart title="Warehouse Inventory Value" data={data?.valueReport ?? []} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'stock', label: 'Stock Report' },
          { value: 'transfers', label: 'Transfer Report' },
          { value: 'value', label: 'Value Report' },
        ]}
      />

      {tab === 'stock' ? (
        <ReportTable
          title="Warehouse Stock Report"
          rows={data?.stockReport ?? []}
          columns={[
            { key: 'warehouseName', header: 'Warehouse' },
            { key: 'stockQuantity', header: 'Stock Quantity', render: (row) => formatNumber(row.stockQuantity) },
            { key: 'inventoryValue', header: 'Inventory Value', render: (row) => formatCurrency(row.inventoryValue) },
            { key: 'productCount', header: 'Product Count', render: (row) => formatNumber(row.productCount) },
          ]}
        />
      ) : null}

      {tab === 'transfers' ? (
        <ReportTable
          title="Warehouse Transfer Report"
          rows={data?.transferReport ?? []}
          columns={[
            { key: 'label', header: 'Period' },
            { key: 'transfers', header: 'Transfers', render: (row) => formatNumber(row.transfers) },
            { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
          ]}
        />
      ) : null}

      {tab === 'value' ? (
        <ReportTable
          title="Warehouse Inventory Value Report"
          rows={data?.stockReport ?? []}
          columns={[
            { key: 'warehouseName', header: 'Warehouse' },
            { key: 'inventoryValue', header: 'Inventory Value', render: (row) => formatCurrency(row.inventoryValue) },
            { key: 'productCount', header: 'Products', render: (row) => formatNumber(row.productCount) },
          ]}
        />
      ) : null}
    </ReportPageLayout>
  )
}
