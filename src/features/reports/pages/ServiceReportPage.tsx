import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { PerformanceBarChart, RevenueChart } from '@/features/reports/components/ReportCharts'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters } from '@/features/reports/types'
import { useServiceReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatCurrency, formatNumber } from '@/lib/format'

export function ServiceReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('services')
  const { data, isLoading } = useServiceReport(filters)

  return (
    <ReportPageLayout
      title="Service Reports"
      description="Service revenue, category performance, and technician performance reports."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showWarehouse: false, showCategory: false }}
      actions={
        <ExportButtons
          title="Service Report"
          filename="service-report"
          columns={[
            { header: 'Service', value: (row) => row.serviceName },
            { header: 'Jobs', value: (row) => row.jobs },
            { header: 'Revenue', value: (row) => row.revenue },
            { header: 'Category', value: (row) => row.categoryName },
          ]}
          rows={data?.rows ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Jobs', value: data?.summary.totalJobs ?? 0, format: 'number' },
          { label: 'Completed Jobs', value: data?.summary.completedJobs ?? 0, format: 'number' },
          { label: 'Service Revenue', value: data?.summary.serviceRevenue ?? 0, format: 'currency' },
          { label: 'Average Job Value', value: data?.summary.averageJobValue ?? 0, format: 'currency' },
        ]}
      />

      <RevenueChart title="Service Revenue Report" data={data?.revenueReport ?? []} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'services', label: 'By Service' },
          { value: 'categories', label: 'By Category' },
          { value: 'technicians', label: 'Technicians' },
        ]}
      />

      {tab === 'services' ? (
        <ReportTable
          title="Service Revenue Report"
          rows={data?.rows ?? []}
          columns={[
            { key: 'serviceName', header: 'Service Name' },
            { key: 'jobs', header: 'Jobs', render: (row) => formatNumber(row.jobs) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}

      {tab === 'categories' ? (
        <ReportTable
          title="Service Category Report"
          rows={data?.categoryReport ?? []}
          columns={[
            { key: 'categoryName', header: 'Category' },
            { key: 'jobs', header: 'Jobs', render: (row) => formatNumber(row.jobs) },
            { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
          ]}
        />
      ) : null}

      {tab === 'technicians' ? (
        <>
          <PerformanceBarChart
            title="Technician Performance"
            data={(data?.technicianPerformance ?? []).map((entry) => ({
              label: entry.technician,
              value: entry.revenue,
            }))}
            name="Revenue"
          />
          <ReportTable
            title="Technician Performance Report"
            rows={data?.technicianPerformance ?? []}
            columns={[
              { key: 'technician', header: 'Technician' },
              { key: 'jobs', header: 'Jobs', render: (row) => formatNumber(row.jobs) },
              { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
            ]}
          />
        </>
      ) : null}
    </ReportPageLayout>
  )
}
