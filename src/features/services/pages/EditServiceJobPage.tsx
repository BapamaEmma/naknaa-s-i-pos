import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceJobEditForm } from '@/features/services/components/ServiceJobEditForm'
import { SERVICE_ROUTES } from '@/features/services/constants'
import { useServiceJob, useUpdateServiceJob } from '@/features/services/hooks/use-services'
import type { ServiceJobEditFormOutput } from '@/features/services/schemas/service.schema'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function EditServiceJobPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const { data: job, isLoading, isError } = useServiceJob(id)
  const updateJob = useUpdateServiceJob()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!hasRole([USER_ROLES.ADMIN, USER_ROLES.CASHIER])) {
    return <Navigate to={SERVICE_ROUTES.JOB_DETAIL(id)} replace />
  }

  const handleSubmit = async (values: ServiceJobEditFormOutput) => {
    if (!id) return

    setErrorMessage(null)

    try {
      await updateJob.mutateAsync({
        id,
        input: {
          customerId: values.customerId,
          serviceId: values.serviceId,
          technicianId: values.technicianId,
          serviceDate: values.serviceDate,
          expectedCompletionDate: values.expectedCompletionDate,
          completionDate: values.completionDate || null,
          status: values.status,
          amount: values.amount,
          notes: values.notes,
        },
      })
      navigate(SERVICE_ROUTES.JOB_DETAIL(id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update service job.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Service job not found.</p>
        <Button asChild variant="outline">
          <Link to={SERVICE_ROUTES.JOBS}>Back to service jobs</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Edit Job ${job.jobNumber}`}
        description={`${job.serviceName} · ${job.customerName}`}
        backTo={SERVICE_ROUTES.JOB_DETAIL(id)}
        backLabel="Back to job details"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <ServiceJobEditForm
        job={job}
        isSubmitting={updateJob.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
