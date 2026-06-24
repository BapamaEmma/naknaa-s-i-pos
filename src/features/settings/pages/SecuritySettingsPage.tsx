import { SecuritySettingsForm } from '@/features/settings/components/SecuritySettingsForm'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useSecuritySettings,
  useSecurityStatus,
  useUpdateSecuritySettings,
} from '@/features/settings/hooks/use-settings'
import type { SecuritySettingsFormOutput } from '@/features/settings/schemas/settings.schema'

export function SecuritySettingsPage() {
  const { data: settings, isLoading } = useSecuritySettings()
  const { data: status } = useSecurityStatus()
  const updateSettings = useUpdateSecuritySettings()

  const handleSubmit = async (values: SecuritySettingsFormOutput) => {
    await updateSettings.mutateAsync(values)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Security Settings"
        description="Configure password policies, session timeouts, and access controls."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <SecuritySettingsForm
        settings={settings}
        status={status}
        isLoading={isLoading}
        isSubmitting={updateSettings.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
