import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceJobForm } from '@/features/services/components/ServiceJobForm'
import { SERVICE_ROUTES } from '@/features/services/constants'
import { useCreateServiceJob } from '@/features/services/hooks/use-services'
import type { ServiceJobFormOutput } from '@/features/services/schemas/service.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function CreateServiceJobPage() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const createJob = useCreateServiceJob()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole([USER_ROLES.ADMIN, USER_ROLES.CASHIER])) {
    return <Navigate to={SERVICE_ROUTES.JOBS} replace />
  }

  const handleSubmit = async (values: ServiceJobFormOutput) => {
    setErrorMessage(null)

    try {
      const job = await createJob.mutateAsync({
        customerId: values.customerId,
        serviceId: values.serviceId,
        technicianId: values.technicianId,
        serviceDate: values.serviceDate,
        expectedCompletionDate: values.expectedCompletionDate,
        amount: values.amount,
        notes: values.notes,
      })

      navigate(SERVICE_ROUTES.JOB_DETAIL(job.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create service job.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create Service Job"
        description="Schedule a new service job for a customer."
        backTo={SERVICE_ROUTES.JOBS}
        backLabel="Back to service jobs"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <ServiceJobForm isSubmitting={createJob.isPending} onSubmit={handleSubmit} />
    </div>
  )
}
