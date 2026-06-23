import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SERVICE_STATUS_LABELS } from '@/features/services/constants'
import type { ServiceDetail } from '@/features/services/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface ServiceInfoCardProps {
  service: ServiceDetail
}

export function ServiceInfoCard({ service }: ServiceInfoCardProps) {
  const fields = [
    { label: 'Service Code', value: service.serviceCode },
    { label: 'Service Name', value: service.serviceName },
    { label: 'Category', value: service.categoryName },
    { label: 'Description', value: service.description || '—' },
    { label: 'Standard Price', value: formatCurrency(service.standardPrice) },
    {
      label: 'Status',
      value: (
        <Badge variant={service.status === 'active' ? 'success' : 'secondary'}>
          {SERVICE_STATUS_LABELS[service.status]}
        </Badge>
      ),
    },
    { label: 'Created Date', value: formatDate(service.createdAt) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Information</CardTitle>
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
