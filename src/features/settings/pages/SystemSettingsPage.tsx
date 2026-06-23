import { SystemPreferencesForm } from '@/features/settings/components/SystemPreferencesForm'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from '@/features/settings/hooks/use-settings'
import type { SystemSettingsFormOutput } from '@/features/settings/schemas/settings.schema'

export function SystemSettingsPage() {
  const { data, isLoading } = useSystemSettings()
  const updateSettings = useUpdateSystemSettings()

  const handleSubmit = async (values: SystemSettingsFormOutput) => {
    await updateSettings.mutateAsync(values)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="System Preferences"
        description="Currency, date/time formats, theme mode, and numbering sequences."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <SystemPreferencesForm
        settings={data}
        isLoading={isLoading}
        isSubmitting={updateSettings.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
