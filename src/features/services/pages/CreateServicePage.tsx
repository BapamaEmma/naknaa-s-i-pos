import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceForm } from '@/features/services/components/ServiceForm'
import { SERVICE_ROUTES } from '@/features/services/constants'
import { useCreateService } from '@/features/services/hooks/use-services'
import type { ServiceFormOutput } from '@/features/services/schemas/service.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function CreateServicePage() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const createService = useCreateService()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole(USER_ROLES.ADMIN)) {
    return <Navigate to={SERVICE_ROUTES.LIST} replace />
  }

  const handleSubmit = async (values: ServiceFormOutput) => {
    setErrorMessage(null)

    try {
      const service = await createService.mutateAsync({
        serviceName: values.serviceName,
        categoryId: values.categoryId,
        description: values.description,
        standardPrice: values.standardPrice,
        status: values.status,
      })

      navigate(SERVICE_ROUTES.DETAIL(service.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create service.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create Service"
        description="Add a new service offering to the NakNaa service catalog."
        backTo={SERVICE_ROUTES.LIST}
        backLabel="Back to services"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <ServiceForm
        isSubmitting={createService.isPending}
        submitLabel="Create service"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
