import { AlertTriangle, Bell, ClipboardList, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardNotification } from '@/features/dashboard/types'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const iconMap = {
  low_stock: AlertTriangle,
  activity: ClipboardList,
  adjustment: ClipboardList,
  system: Settings,
} as const

interface NotificationPanelProps {
  notifications: DashboardNotification[]
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type]

          return (
            <div
              key={notification.id}
              className={cn(
                'flex gap-3 rounded-lg border p-3',
                notification.type === 'low_stock' && 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20',
              )}
            >
              <div className="mt-0.5 rounded-md bg-muted p-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(notification.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
