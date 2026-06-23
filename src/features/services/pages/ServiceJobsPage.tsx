import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceJobFilters } from '@/features/services/components/ServiceJobFilters'
import { ServiceJobTable } from '@/features/services/components/ServiceJobTable'
import { ServiceStatsCards } from '@/features/services/components/ServiceStatsCards'
import { TechnicianTable } from '@/features/services/components/TechnicianTable'
import { SERVICE_ROUTES } from '@/features/services/constants'
import {
  useServiceDashboard,
  useServiceJobs,
  useTechnicians,
} from '@/features/services/hooks/use-services'
import type { ServiceJobListFilters } from '@/features/services/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function ServiceJobsPage() {
  const { hasRole } = useAuth()
  const canManageJobs = hasRole([USER_ROLES.ADMIN, USER_ROLES.CASHIER])
  const [filters, setFilters] = useState<ServiceJobListFilters>({
    page: 1,
    limit: 10,
    status: 'all',
    categoryId: 'all',
    historyOnly: false,
  })
  const [historyFilters, setHistoryFilters] = useState<ServiceJobListFilters>({
    page: 1,
    limit: 10,
    status: 'completed',
    categoryId: 'all',
    historyOnly: true,
  })

  const { data: dashboard, isLoading: dashboardLoading } = useServiceDashboard()
  const { data, isLoading } = useServiceJobs(filters)
  const { data: historyData, isLoading: historyLoading } = useServiceJobs(historyFilters)
  const { data: technicians = [], isLoading: techniciansLoading } = useTechnicians()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Service Jobs"
        description="Track active service jobs, technician workload, and completed service history."
        backTo={SERVICE_ROUTES.LIST}
        backLabel="Back to services"
        action={
          canManageJobs ? (
            <Button asChild>
              <Link to={SERVICE_ROUTES.JOB_CREATE}>
                <Plus className="h-4 w-4" />
                Create Job
              </Link>
            </Button>
          ) : null
        }
      />

      <ServiceStatsCards summary={dashboard} isLoading={dashboardLoading} compact />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <ServiceJobFilters filters={filters} onChange={setFilters} />
          <ServiceJobTable data={data} isLoading={isLoading} />
          {data && data.meta.totalPages > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} jobs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={data.meta.page <= 1}
                  onClick={() =>
                    setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={data.meta.page >= data.meta.totalPages}
                  onClick={() =>
                    setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <TechnicianTable technicians={technicians} isLoading={techniciansLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Completed service jobs and historical records.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ServiceJobFilters
            filters={historyFilters}
            onChange={setHistoryFilters}
            historyOnly
          />
          <ServiceJobTable data={historyData} isLoading={historyLoading} />

          {historyData && historyData.meta.totalPages > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {historyData.meta.page} of {historyData.meta.totalPages} ·{' '}
                {historyData.meta.total} records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={historyData.meta.page <= 1}
                  onClick={() =>
                    setHistoryFilters((current) => ({
                      ...current,
                      page: (current.page ?? 1) - 1,
                    }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={historyData.meta.page >= historyData.meta.totalPages}
                  onClick={() =>
                    setHistoryFilters((current) => ({
                      ...current,
                      page: (current.page ?? 1) + 1,
                    }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
