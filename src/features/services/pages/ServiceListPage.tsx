import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, FolderTree, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceCategoryChart } from '@/features/services/components/ServiceCategoryChart'
import { ServiceDeleteDialog } from '@/features/services/components/ServiceDeleteDialog'
import { ServiceFilters } from '@/features/services/components/ServiceFilters'
import { ServiceRevenueChart } from '@/features/services/components/ServiceRevenueChart'
import { ServiceStatsCards } from '@/features/services/components/ServiceStatsCards'
import { ServiceTable } from '@/features/services/components/ServiceTable'
import { TechnicianPerformanceChart } from '@/features/services/components/TechnicianPerformanceChart'
import { SERVICE_ROUTES } from '@/features/services/constants'
import {
  useServiceAnalytics,
  useServiceDashboard,
  useServices,
} from '@/features/services/hooks/use-services'
import type { ServiceListFilters, ServiceListItem } from '@/features/services/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function ServiceListPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [filters, setFilters] = useState<ServiceListFilters>({
    page: 1,
    limit: 10,
    status: 'all',
    categoryId: 'all',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null)

  const { data: dashboard, isLoading: dashboardLoading } = useServiceDashboard()
  const { data: analytics, isLoading: analyticsLoading } = useServiceAnalytics()
  const { data, isLoading } = useServices(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Services"
        description="Manage service offerings, track jobs, and monitor service performance."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={SERVICE_ROUTES.CATEGORIES}>
                <FolderTree className="h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={SERVICE_ROUTES.JOBS}>
                <Briefcase className="h-4 w-4" />
                Jobs
              </Link>
            </Button>
            {canManage ? (
              <Button asChild>
                <Link to={SERVICE_ROUTES.CREATE}>
                  <Plus className="h-4 w-4" />
                  Add Service
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <ServiceStatsCards summary={dashboard} isLoading={dashboardLoading} />

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ServiceRevenueChart
          data={analytics?.monthlyRevenue}
          isLoading={analyticsLoading}
        />
        <ServiceCategoryChart
          data={analytics?.categoryPerformance}
          isLoading={analyticsLoading}
        />
        <TechnicianPerformanceChart
          data={analytics?.technicianPerformance}
          isLoading={analyticsLoading}
        />
      </section>

      <ServiceFilters filters={filters} onChange={setFilters} />
      <ServiceTable
        data={data}
        isLoading={isLoading}
        canManage={canManage}
        onDelete={(service) => {
          setSelectedService(service)
          setDeleteOpen(true)
        }}
      />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} services
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ServiceDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        service={selectedService}
      />
    </div>
  )
}
