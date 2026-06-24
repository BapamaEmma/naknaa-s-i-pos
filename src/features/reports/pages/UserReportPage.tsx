import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { ReportPageLayout } from '@/features/reports/components/ReportPageLayout'
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards'
import { ReportTable } from '@/features/reports/components/ReportTable'
import type { ReportFilters, ReportTableColumn, UserReportRow } from '@/features/reports/types'
import { useUserReport } from '@/features/reports/hooks/use-reports'
import { reportFilterDefaults } from '@/services/reports/reportService'
import { formatDateTime, formatNumber } from '@/lib/format'

export function UserReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(reportFilterDefaults)
  const [tab, setTab] = useState('login')
  const { data, isLoading } = useUserReport(filters)

  return (
    <ReportPageLayout
      title="User Activity Reports"
      description="User login activity, sales by user, inventory actions, and activity summaries."
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isLoading}
      filterOptions={{ showWarehouse: false, showCategory: false }}
      actions={
        <ExportButtons
          title="User Activity Report"
          filename="user-activity-report"
          columns={[
            { header: 'User', value: (row) => row.userName },
            { header: 'Role', value: (row) => row.role },
            { header: 'Actions', value: (row) => row.actions },
            { header: 'Last Login', value: (row) => row.lastLogin ?? '' },
          ]}
          rows={data?.activitySummary ?? []}
        />
      }
    >
      <ReportSummaryCards
        items={[
          { label: 'Total Users', value: data?.summary.totalUsers ?? 0, format: 'number' },
          { label: 'Active Users', value: data?.summary.activeUsers ?? 0, format: 'number' },
          { label: 'Logins This Month', value: data?.summary.loginsThisMonth ?? 0, format: 'number' },
          { label: 'Total Actions', value: data?.summary.totalActions ?? 0, format: 'number' },
        ]}
      />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'login', label: 'Login Report' },
          { value: 'sales', label: 'Sales By User' },
          { value: 'inventory', label: 'Inventory Actions' },
          { value: 'summary', label: 'Activity Summary' },
        ]}
      />

      {tab === 'login' ? (
        <ReportTable title="User Login Report" rows={data?.loginReport ?? []} columns={userColumns} />
      ) : null}

      {tab === 'sales' ? (
        <ReportTable
          title="Sales By User"
          rows={data?.salesByUser ?? []}
          columns={[
            ...userColumns.slice(0, 2),
            { key: 'salesCount', header: 'Sales', render: (row) => formatNumber(row.salesCount) },
            userColumns[3],
          ]}
        />
      ) : null}

      {tab === 'inventory' ? (
        <ReportTable
          title="Inventory Actions By User"
          rows={data?.inventoryActions ?? []}
          columns={[
            ...userColumns.slice(0, 2),
            { key: 'inventoryActions', header: 'Inventory Actions', render: (row) => formatNumber(row.inventoryActions) },
            userColumns[3],
          ]}
        />
      ) : null}

      {tab === 'summary' ? (
        <ReportTable title="User Activity Summary" rows={data?.activitySummary ?? []} columns={userColumns} />
      ) : null}
    </ReportPageLayout>
  )
}

const userColumns: ReportTableColumn<UserReportRow>[] = [
  { key: 'userName', header: 'User' },
  { key: 'role', header: 'Role' },
  { key: 'actions', header: 'Actions', render: (row) => formatNumber(row.actions) },
  {
    key: 'lastLogin',
    header: 'Last Login',
    render: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : '—'),
  },
]
