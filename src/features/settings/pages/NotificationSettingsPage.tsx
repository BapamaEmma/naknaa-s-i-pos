import { NotificationSettingsForm } from '@/features/settings/components/NotificationSettingsForm'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/features/settings/hooks/use-settings'
import type { NotificationSettingsFormOutput } from '@/features/settings/schemas/settings.schema'

export function NotificationSettingsPage() {
  const { data, isLoading } = useNotificationSettings()
  const updateSettings = useUpdateNotificationSettings()

  const handleSubmit = async (values: NotificationSettingsFormOutput) => {
    await updateSettings.mutateAsync(values)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Notification Settings"
        description="Control alerts for stock, sales, transfers, users, and system events."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <NotificationSettingsForm
        settings={data}
        isLoading={isLoading}
        isSubmitting={updateSettings.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
