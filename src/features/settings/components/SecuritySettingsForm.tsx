import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  securitySettingsSchema,
  type SecuritySettingsFormInput,
  type SecuritySettingsFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { SecuritySettings, SecurityStatusSummary } from '@/features/settings/types'
import { formatDateTime } from '@/lib/format'

interface SecuritySettingsFormProps {
  settings?: SecuritySettings
  status?: SecurityStatusSummary
  isLoading?: boolean
  isSubmitting?: boolean
  onSubmit: (values: SecuritySettingsFormOutput) => Promise<void>
}

const defaultValues: SecuritySettingsFormInput = {
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  loginAttemptLimit: 5,
  twoFactorEnabled: false,
  userLockoutEnabled: true,
}

function StatusIcon({ level }: { level: SecurityStatusSummary['overallStatus'] }) {
  switch (level) {
    case 'secure':
      return <ShieldCheck className="h-5 w-5 text-green-600" />
    case 'moderate':
      return <Shield className="h-5 w-5 text-amber-600" />
    case 'attention':
      return <ShieldAlert className="h-5 w-5 text-destructive" />
  }
}

export function SecuritySettingsForm({
  settings,
  status,
  isLoading,
  isSubmitting,
  onSubmit,
}: SecuritySettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SecuritySettingsFormInput, unknown, SecuritySettingsFormOutput>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (settings) {
      reset({
        passwordExpiryDays: settings.passwordExpiryDays,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        loginAttemptLimit: settings.loginAttemptLimit,
        twoFactorEnabled: settings.twoFactorEnabled,
        userLockoutEnabled: settings.userLockoutEnabled,
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
      {status ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon level={status.overallStatus} />
              Current Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Overall</p>
              <Badge
                variant={
                  status.overallStatus === 'secure'
                    ? 'success'
                    : status.overallStatus === 'moderate'
                      ? 'warning'
                      : 'destructive'
                }
                className="mt-1 capitalize"
              >
                {status.overallStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Two-Factor Auth</p>
              <p className="font-medium">{status.twoFactorEnabled ? 'Enabled' : 'Disabled (Future)'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Reviewed</p>
              <p className="font-medium">{formatDateTime(status.lastReviewedAt)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Security Policies</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
            <Input id="passwordExpiryDays" type="number" {...register('passwordExpiryDays')} />
            {errors.passwordExpiryDays ? (
              <p className="text-sm text-destructive">{errors.passwordExpiryDays.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</Label>
            <Input id="sessionTimeoutMinutes" type="number" {...register('sessionTimeoutMinutes')} />
            {errors.sessionTimeoutMinutes ? (
              <p className="text-sm text-destructive">{errors.sessionTimeoutMinutes.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginAttemptLimit">Login Attempt Limit</Label>
            <Input id="loginAttemptLimit" type="number" {...register('loginAttemptLimit')} />
            {errors.loginAttemptLimit ? (
              <p className="text-sm text-destructive">{errors.loginAttemptLimit.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
              <p className="text-xs text-muted-foreground">Coming in a future release</p>
            </div>
            <Switch
              id="twoFactorEnabled"
              checked={watch('twoFactorEnabled')}
              onCheckedChange={(checked) => setValue('twoFactorEnabled', checked)}
              disabled
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="userLockoutEnabled">User Lockout</Label>
            <Switch
              id="userLockoutEnabled"
              checked={watch('userLockoutEnabled')}
              onCheckedChange={(checked) => setValue('userLockoutEnabled', checked)}
            />
          </div>
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
