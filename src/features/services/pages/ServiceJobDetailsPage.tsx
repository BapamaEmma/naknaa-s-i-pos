import { Link, useParams } from 'react-router-dom'
import { Pencil, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CustomerServiceHistory } from '@/features/services/components/CustomerServiceHistory'
import { PageHeader } from '@/features/services/components/PageHeader'
import { ServiceJobDetailsCard } from '@/features/services/components/ServiceJobDetailsCard'
import { ServiceJobStatusBadge } from '@/features/services/components/ServiceJobStatusBadge'
import { SERVICE_ROUTES } from '@/features/services/constants'
import { useCustomerServiceHistory, useServiceJob } from '@/features/services/hooks/use-services'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function ServiceJobDetailsPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const canManageJobs = hasRole([USER_ROLES.ADMIN, USER_ROLES.CASHIER])
  const { data: job, isLoading, isError } = useServiceJob(id)
  const { data: history = [], isLoading: historyLoading } = useCustomerServiceHistory(
    job?.customerId,
  )

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
        title={`Job ${job.jobNumber}`}
        description={`${job.serviceName} · ${job.customerName}`}
        backTo={SERVICE_ROUTES.JOBS}
        backLabel="Back to service jobs"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ServiceJobStatusBadge status={job.status} />
            <Button variant="outline" asChild>
              <Link to={SERVICE_ROUTES.JOB_RECEIPT(id)}>
                <Receipt className="h-4 w-4" />
                View Receipt
              </Link>
            </Button>
            {canManageJobs ? (
              <Button asChild>
                <Link to={SERVICE_ROUTES.JOB_EDIT(id)}>
                  <Pencil className="h-4 w-4" />
                  Edit Job
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <ServiceJobDetailsCard job={job} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Customer Service History</h2>
          <p className="text-sm text-muted-foreground">
            Previous services for {job.customerName}.
          </p>
        </div>
        <CustomerServiceHistory items={history} isLoading={historyLoading} />
      </section>
    </div>
  )
}
