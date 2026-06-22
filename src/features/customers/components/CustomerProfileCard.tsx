import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CUSTOMER_STATUS_LABELS } from '@/features/customers/constants'
import type { Customer } from '@/features/customers/types'
import { formatDate } from '@/lib/format'

interface CustomerProfileCardProps {
  customer: Customer
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const fields = [
    { label: 'Customer Code', value: customer.customerCode },
    { label: 'Full Name', value: customer.fullName },
    { label: 'Phone Number', value: customer.phoneNumber },
    { label: 'Email', value: customer.email || '—' },
    { label: 'Address', value: customer.address || '—' },
    { label: 'City', value: customer.city || '—' },
    { label: 'Registration Date', value: formatDate(customer.registrationDate) },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Customer Profile</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Contact and account information.</p>
        </div>
        <Badge variant={customer.status === 'active' ? 'success' : 'secondary'}>
          {CUSTOMER_STATUS_LABELS[customer.status]}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</p>
              <p className="mt-1 text-sm font-medium">{field.value}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-1 text-sm font-medium">{CUSTOMER_STATUS_LABELS[customer.status]}</p>
        </div>
      </CardContent>
    </Card>
  )
}
