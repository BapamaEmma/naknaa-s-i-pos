import { BusinessSettingsForm } from '@/features/settings/components/BusinessSettingsForm'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useBusinessSettings,
  useUpdateBusinessSettings,
} from '@/features/settings/hooks/use-settings'
import type { BusinessSettingsFormOutput } from '@/features/settings/schemas/settings.schema'

export function BusinessSettingsPage() {
  const { data, isLoading } = useBusinessSettings()
  const updateSettings = useUpdateBusinessSettings()

  const handleSubmit = async (values: BusinessSettingsFormOutput) => {
    await updateSettings.mutateAsync(values)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Business Settings"
        description="Manage company information, contact details, and tax identification."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <BusinessSettingsForm
        settings={data}
        isLoading={isLoading}
        isSubmitting={updateSettings.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
