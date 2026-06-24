import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FUTURE_ROLES } from '@/features/users/constants'
import type { UserDetail } from '@/features/users/types'

interface UserPermissionsCardProps {
  user: UserDetail
}

export function UserPermissionsCard({ user }: UserPermissionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Permissions</CardTitle>
        <CardDescription>
          Permissions assigned through the {user.roleName} role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {user.permissions.map((permission) => (
            <Badge key={permission} variant="secondary">
              {permission}
            </Badge>
          ))}
        </div>

        <ul className="space-y-2">
          {user.permissions.map((permission) => (
            <li key={permission} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {permission}
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-dashed p-4">
          <p className="text-sm font-medium">Future roles</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Planned roles for upcoming releases.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FUTURE_ROLES.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
