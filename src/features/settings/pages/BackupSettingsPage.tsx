import { BackupSettingsCard } from '@/features/settings/components/BackupSettingsCard'
import { SettingsPageHeader } from '@/features/settings/components/SettingsPageHeader'
import { SETTINGS_ROUTES } from '@/features/settings/constants'
import {
  useBackupSettings,
  useManualBackup,
  useUpdateBackupSettings,
} from '@/features/settings/hooks/use-settings'
import type { BackupSettingsFormOutput } from '@/features/settings/schemas/settings.schema'

export function BackupSettingsPage() {
  const { data, isLoading } = useBackupSettings()
  const updateSettings = useUpdateBackupSettings()
  const manualBackup = useManualBackup()

  const handleSubmit = async (values: BackupSettingsFormOutput) => {
    await updateSettings.mutateAsync(values)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPageHeader
        title="Backup Settings"
        description="Manage manual and scheduled data backups."
        backTo={SETTINGS_ROUTES.ROOT}
      />
      <BackupSettingsCard
        settings={data}
        isLoading={isLoading}
        isSubmitting={updateSettings.isPending}
        isBackingUp={manualBackup.isPending}
        onSubmit={handleSubmit}
        onManualBackup={async () => {
          await manualBackup.mutateAsync()
        }}
      />
    </div>
  )
}
