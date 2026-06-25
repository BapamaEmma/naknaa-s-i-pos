import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceInfoCard } from '@/features/services/components/ServiceInfoCard'
import { SERVICE_ROUTES } from '@/features/services/constants'
import { useService } from '@/features/services/hooks/use-services'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function ServiceDetailsPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const { data: service, isLoading, isError } = useService(id)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (isError || !service) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Service not found.</p>
        <Button asChild variant="outline">
          <Link to={SERVICE_ROUTES.LIST}>Back to services</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={service.serviceName}
        description={`${service.serviceCode} · ${service.categoryName}`}
        backTo={SERVICE_ROUTES.LIST}
        backLabel="Back to services"
        action={
          canManage ? (
            <Button asChild>
              <Link to={SERVICE_ROUTES.EDIT(id)}>
                <Pencil className="h-4 w-4" />
                Edit Service
              </Link>
            </Button>
          ) : null
        }
      />

      <ServiceInfoCard service={service} />
    </div>
  )
}
