import { useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ReportFilters } from '@/features/reports/components/ReportFilters'
import { REPORT_ROUTES } from '@/features/reports/constants'
import type { ReportFilters as ReportFiltersType } from '@/features/reports/types'
import { reportFilterDefaults } from '@/services/reports/reportService'

interface ReportPageLayoutProps {
  title: string
  description: string
  isLoading?: boolean
  filters?: ReportFiltersType
  onFiltersChange?: (filters: ReportFiltersType) => void
  filterOptions?: {
    showWarehouse?: boolean
    showUser?: boolean
    showCategory?: boolean
    showPeriod?: boolean
  }
  actions?: ReactNode
  children: ReactNode
}

export function ReportPageLayout({
  title,
  description,
  isLoading = false,
  filters = reportFilterDefaults,
  onFiltersChange,
  filterOptions,
  actions,
  children,
}: ReportPageLayoutProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  return (
    <div className="space-y-6 report-print-root">
      <PageHeader
        title={title}
        description={description}
        backTo={REPORT_ROUTES.ROOT}
        backLabel="Back to reports"
        action={actions}
      />

      <ReportFilters
        value={localFilters}
        onChange={(next) => {
          setLocalFilters(next)
          onFiltersChange?.(next)
        }}
        {...filterOptions}
      />

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
