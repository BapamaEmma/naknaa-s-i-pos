import { ReceiptSettingsForm } from '@/features/settings/components/ReceiptSettingsForm'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useBusinessSettings,
  useReceiptSettings,
  useUpdateReceiptSettings,
} from '@/features/settings/hooks/use-settings'
import type { ReceiptSettingsFormOutput } from '@/features/settings/schemas/settings.schema'

export function ReceiptSettingsPage() {
  const { data: receiptSettings, isLoading } = useReceiptSettings()
  const { data: businessSettings } = useBusinessSettings()
  const updateSettings = useUpdateReceiptSettings()

  const handleSubmit = async (values: ReceiptSettingsFormOutput) => {
    await updateSettings.mutateAsync(values)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Receipt Settings"
        description="Configure receipt layout, display options, and printer settings."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <ReceiptSettingsForm
        settings={receiptSettings}
        business={businessSettings}
        isLoading={isLoading}
        isSubmitting={updateSettings.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
