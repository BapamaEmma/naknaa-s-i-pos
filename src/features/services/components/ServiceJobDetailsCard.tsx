import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SERVICE_JOB_STATUS_LABELS } from '@/features/services/constants'
import type { ServiceJobDetail, ServiceJobStatus } from '@/features/services/types'
import { formatCurrency, formatDate } from '@/lib/format'

function getJobStatusVariant(status: ServiceJobStatus) {
  switch (status) {
    case 'completed':
      return 'success' as const
    case 'pending':
      return 'warning' as const
    case 'in_progress':
      return 'default' as const
    case 'cancelled':
      return 'secondary' as const
  }
}

interface ServiceJobDetailsCardProps {
  job: ServiceJobDetail
}

export function ServiceJobDetailsCard({ job }: ServiceJobDetailsCardProps) {
  const fields = [
    { label: 'Job Number', value: job.jobNumber },
    { label: 'Customer', value: job.customerName },
    { label: 'Customer Phone', value: job.customerPhone || '—' },
    { label: 'Customer Email', value: job.customerEmail || '—' },
    { label: 'Service', value: job.serviceName },
    { label: 'Service Code', value: job.serviceCode },
    { label: 'Category', value: job.categoryName },
    { label: 'Technician', value: job.technician },
    { label: 'Service Date', value: formatDate(job.serviceDate) },
    {
      label: 'Expected Completion',
      value: formatDate(job.expectedCompletionDate),
    },
    {
      label: 'Completion Date',
      value: job.completionDate ? formatDate(job.completionDate) : '—',
    },
    {
      label: 'Status',
      value: (
        <Badge variant={getJobStatusVariant(job.status)}>
          {SERVICE_JOB_STATUS_LABELS[job.status]}
        </Badge>
      ),
    },
    { label: 'Amount', value: formatCurrency(job.amount) },
    { label: 'Notes', value: job.notes || '—' },
    { label: 'Created', value: formatDate(job.createdAt) },
    { label: 'Last Updated', value: formatDate(job.updatedAt) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{field.label}</p>
            <div className="font-medium">{field.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
