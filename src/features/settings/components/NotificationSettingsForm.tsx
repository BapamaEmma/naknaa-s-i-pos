import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  notificationSettingsSchema,
  type NotificationSettingsFormInput,
  type NotificationSettingsFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { NotificationSettings } from '@/features/settings/types'

interface NotificationSettingsFormProps {
  settings?: NotificationSettings
  isLoading?: boolean
  isSubmitting?: boolean
  onSubmit: (values: NotificationSettingsFormOutput) => Promise<void>
}

const defaultValues: NotificationSettingsFormInput = {
  lowStockAlerts: true,
  newSaleNotifications: true,
  warehouseTransferNotifications: true,
  newUserNotifications: true,
  systemAlerts: true,
  inAppDelivery: true,
  emailDelivery: false,
  whatsAppDelivery: false,
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <Label htmlFor={id} className={disabled ? 'text-muted-foreground' : undefined}>
          {label}
        </Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

export function NotificationSettingsForm({
  settings,
  isLoading,
  isSubmitting,
  onSubmit,
}: NotificationSettingsFormProps) {
  const { handleSubmit, reset, watch, setValue } = useForm<
    NotificationSettingsFormInput,
    unknown,
    NotificationSettingsFormOutput
  >({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (settings) {
      reset({
        lowStockAlerts: settings.lowStockAlerts,
        newSaleNotifications: settings.newSaleNotifications,
        warehouseTransferNotifications: settings.warehouseTransferNotifications,
        newUserNotifications: settings.newUserNotifications,
        systemAlerts: settings.systemAlerts,
        inAppDelivery: settings.inAppDelivery,
        emailDelivery: settings.emailDelivery,
        whatsAppDelivery: settings.whatsAppDelivery,
      })
    }
  }, [settings, reset])

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ToggleRow
            id="lowStockAlerts"
            label="Low Stock Alerts"
            checked={watch('lowStockAlerts')}
            onCheckedChange={(checked) => setValue('lowStockAlerts', checked)}
          />
          <ToggleRow
            id="newSaleNotifications"
            label="New Sale Notifications"
            checked={watch('newSaleNotifications')}
            onCheckedChange={(checked) => setValue('newSaleNotifications', checked)}
          />
          <ToggleRow
            id="warehouseTransferNotifications"
            label="Warehouse Transfer Notifications"
            checked={watch('warehouseTransferNotifications')}
            onCheckedChange={(checked) => setValue('warehouseTransferNotifications', checked)}
          />
          <ToggleRow
            id="newUserNotifications"
            label="New User Notifications"
            checked={watch('newUserNotifications')}
            onCheckedChange={(checked) => setValue('newUserNotifications', checked)}
          />
          <ToggleRow
            id="systemAlerts"
            label="System Alerts"
            checked={watch('systemAlerts')}
            onCheckedChange={(checked) => setValue('systemAlerts', checked)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ToggleRow
            id="inAppDelivery"
            label="In-App Notification"
            checked={watch('inAppDelivery')}
            onCheckedChange={(checked) => setValue('inAppDelivery', checked)}
          />
          <ToggleRow
            id="emailDelivery"
            label="Email"
            description="Coming in a future release"
            checked={watch('emailDelivery')}
            onCheckedChange={(checked) => setValue('emailDelivery', checked)}
            disabled
          />
          <ToggleRow
            id="whatsAppDelivery"
            label="WhatsApp"
            description="Coming in a future release"
            checked={watch('whatsAppDelivery')}
            onCheckedChange={(checked) => setValue('whatsAppDelivery', checked)}
            disabled
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
