import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceForm } from '@/features/services/components/ServiceForm'
import { SERVICE_ROUTES } from '@/features/services/constants'
import { useService, useUpdateService } from '@/features/services/hooks/use-services'
import type { ServiceFormOutput } from '@/features/services/schemas/service.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function EditServicePage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const { data: service, isLoading, isError } = useService(id)
  const updateService = useUpdateService()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole(USER_ROLES.ADMIN)) {
    return <Navigate to={SERVICE_ROUTES.DETAIL(id)} replace />
  }

  const handleSubmit = async (values: ServiceFormOutput) => {
    if (!id) return

    setErrorMessage(null)

    try {
      await updateService.mutateAsync({
        id,
        input: {
          serviceName: values.serviceName,
          categoryId: values.categoryId,
          description: values.description,
          standardPrice: values.standardPrice,
          status: values.status,
        },
      })
      navigate(SERVICE_ROUTES.DETAIL(id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update service.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
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
        title={`Edit ${service.serviceName}`}
        description={service.categoryName || 'Update service information'}
        backTo={SERVICE_ROUTES.DETAIL(id)}
        backLabel="Back to service details"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <ServiceForm
        service={service}
        isSubmitting={updateService.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
