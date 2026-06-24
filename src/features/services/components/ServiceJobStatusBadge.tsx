import { Badge } from '@/components/ui/badge'
import { SERVICE_JOB_STATUS_LABELS } from '@/features/services/constants'
import type { ServiceJobStatus } from '@/features/services/types'

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

interface ServiceJobStatusBadgeProps {
  status: ServiceJobStatus
}

export function ServiceJobStatusBadge({ status }: ServiceJobStatusBadgeProps) {
  return (
    <Badge variant={getJobStatusVariant(status)}>{SERVICE_JOB_STATUS_LABELS[status]}</Badge>
  )
}
