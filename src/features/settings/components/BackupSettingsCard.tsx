import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Database, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  BACKUP_SCHEDULE_LABELS,
  BACKUP_STATUS_LABELS,
} from '@/features/settings/constants'
import {
  backupSettingsSchema,
  type BackupSettingsFormInput,
  type BackupSettingsFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { BackupSettings } from '@/features/settings/types'
import { formatDateTime } from '@/lib/format'

interface BackupSettingsCardProps {
  settings?: BackupSettings
  isLoading?: boolean
  isSubmitting?: boolean
  isBackingUp?: boolean
  onSubmit: (values: BackupSettingsFormOutput) => Promise<void>
  onManualBackup: () => Promise<void>
}

const defaultValues: BackupSettingsFormInput = {
  automaticBackupEnabled: true,
  backupSchedule: 'daily',
}

function getStatusVariant(status: BackupSettings['backupStatus']) {
  switch (status) {
    case 'success':
      return 'success' as const
    case 'failed':
      return 'destructive' as const
    case 'pending':
      return 'warning' as const
    default:
      return 'secondary' as const
  }
}

export function BackupSettingsCard({
  settings,
  isLoading,
  isSubmitting,
  isBackingUp,
  onSubmit,
  onManualBackup,
}: BackupSettingsCardProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<BackupSettingsFormInput, unknown, BackupSettingsFormOutput>({
    resolver: zodResolver(backupSettingsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (settings) {
      reset({
        automaticBackupEnabled: settings.automaticBackupEnabled,
        backupSchedule: settings.backupSchedule,
      })
    }
  }, [settings, reset])

  if (isLoading) {
    return (
      <LoadingSpinner size="lg" layout="form" />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Last Backup Date</p>
            <p className="font-medium">
              {settings?.lastBackupDate ? formatDateTime(settings.lastBackupDate) : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Backup Status</p>
            <Badge variant={getStatusVariant(settings?.backupStatus ?? 'never')} className="mt-1">
              {BACKUP_STATUS_LABELS[settings?.backupStatus ?? 'never']}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Automatic Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="automaticBackupEnabled">Enable Automatic Backup</Label>
              <Switch
                id="automaticBackupEnabled"
                checked={watch('automaticBackupEnabled')}
                onCheckedChange={(checked) => setValue('automaticBackupEnabled', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupSchedule">Backup Schedule</Label>
              <Select id="backupSchedule" {...register('backupSchedule')}>
                {Object.entries(BACKUP_SCHEDULE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onManualBackup} disabled={isBackingUp}>
            <Download className="h-4 w-4" />
            {isBackingUp ? 'Backing up...' : 'Manual Backup'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
