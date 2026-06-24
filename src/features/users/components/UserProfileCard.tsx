import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { USER_STATUS_LABELS } from '@/features/users/constants'
import type { UserDetail } from '@/features/users/types'
import { formatDate, formatDateTime } from '@/lib/format'

interface UserProfileCardProps {
  user: UserDetail
}

function statusVariant(status: UserDetail['status']) {
  if (status === 'active') return 'success'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const fields = [
    { label: 'Employee ID', value: user.employeeId },
    { label: 'Full Name', value: user.fullName },
    { label: 'Username', value: user.username || '—' },
    { label: 'Email', value: user.email || '—' },
    { label: 'Phone Number', value: user.phoneNumber || '—' },
    { label: 'Role', value: user.roleName },
    { label: 'Branch', value: user.branchName },
    {
      label: 'Status',
      value: <Badge variant={statusVariant(user.status)}>{USER_STATUS_LABELS[user.status]}</Badge>,
    },
    { label: 'Created Date', value: formatDate(user.createdAt) },
    { label: 'Last Login', value: user.lastLogin ? formatDateTime(user.lastLogin) : 'Never' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
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
