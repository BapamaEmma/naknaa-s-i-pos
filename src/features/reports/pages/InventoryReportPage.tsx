import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { InventoryChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { InventoryReportRow, ReportFilters, ReportTableColumn } from '@/features/reports/types'
import { useInventoryReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency, formatNumber } from '@/lib/format'

export function InventoryReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('current')
  const { data, isLoading } = useInventoryReport(filters)

  return (
    <ReportPageLayout
      title="Inventory Reports"
      description="Current stock, movement, valuation, low stock, out-of-stock, and warehouse inventory reports."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showUser: false }}
      actions={
        <ExportButtons
          title="Inventory Report"
          filename="inventory-report"
          columns={[
            { header: 'Product', value: (row) => row.productName },
            { header: 'Category', value: (row) => row.categoryName },
            { header: 'Warehouse', value: (row) => row.warehouseName },
            { header: 'Quantity', value: (row) => row.quantity },
            { header: 'Value', value: (row) => row.inventoryValue },
          ]}
          rows={data?.currentInventory ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Products', value: data?.summary.totalProducts ?? 0, format: 'number' },
          { label: 'Total Quantity', value: data?.summary.totalQuantity ?? 0, format: 'number' },
          { label: 'Inventory Value', value: data?.summary.inventoryValue ?? 0, format: 'currency' },
          { label: 'Low Stock Items', value: data?.summary.lowStockCount ?? 0, format: 'number' },
        ]}
      />

      <InventoryChart
        title="Inventory Valuation By Category"
        description="Speakers, Guitars, Keyboards, and Mixers"
        data={data?.valuationByCategory ?? []}
      />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'current', label: 'Current Inventory' },
          { value: 'movement', label: 'Stock Movement' },
          { value: 'low', label: 'Low Stock' },
          { value: 'out', label: 'Out Of Stock' },
          { value: 'warehouses', label: 'By Warehouse' },
        ]}
      />

      {tab === 'current' ? (
        <ReportTable
          title="Current Inventory Report"
          rows={data?.currentInventory ?? []}
          columns={[
            { key: 'productName', header: 'Product' },
            { key: 'categoryName', header: 'Category' },
            { key: 'warehouseName', header: 'Warehouse' },
            { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
            { key: 'inventoryValue', header: 'Value', render: (row) => formatCurrency(row.inventoryValue) },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <Badge variant={row.status === 'in_stock' ? 'default' : 'destructive'}>
                  {row.status.replace('_', ' ')}
                </Badge>
              ),
            },
          ]}
        />
      ) : null}

      {tab === 'movement' ? (
        <ReportTable
          title="Stock Movement Report"
          rows={data?.stockMovement ?? []}
          columns={[
            { key: 'label', header: 'Day' },
            { key: 'stockIn', header: 'Stock In', render: (row) => formatNumber(row.stockIn) },
            { key: 'stockOut', header: 'Stock Out', render: (row) => formatNumber(row.stockOut) },
          ]}
        />
      ) : null}

      {tab === 'low' ? (
        <ReportTable title="Low Stock Report" rows={data?.lowStock ?? []} columns={inventoryColumns} />
      ) : null}

      {tab === 'out' ? (
        <ReportTable title="Out Of Stock Report" rows={data?.outOfStock ?? []} columns={inventoryColumns} />
      ) : null}

      {tab === 'warehouses' ? (
        <ReportTable
          title="Warehouse Inventory Report"
          rows={data?.byWarehouse ?? []}
          columns={[
            { key: 'warehouseName', header: 'Warehouse' },
            { key: 'productCount', header: 'Products', render: (row) => formatNumber(row.productCount) },
            { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
            { key: 'value', header: 'Inventory Value', render: (row) => formatCurrency(row.value) },
          ]}
        />
      ) : null}
    </ReportPageLayout>
  )
}

const inventoryColumns: ReportTableColumn<InventoryReportRow>[] = [
  { key: 'productName', header: 'Product' },
  { key: 'categoryName', header: 'Category' },
  { key: 'warehouseName', header: 'Warehouse' },
  { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
  { key: 'inventoryValue', header: 'Value', render: (row) => formatCurrency(row.inventoryValue) },
]
