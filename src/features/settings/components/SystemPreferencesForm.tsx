import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_LABELS,
  THEME_MODE_LABELS,
  TIME_FORMAT_LABELS,
} from '@/features/settings/constants'
import {
  systemSettingsSchema,
  type SystemSettingsFormInput,
  type SystemSettingsFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { SystemSettings } from '@/features/settings/types'

interface SystemPreferencesFormProps {
  settings?: SystemSettings
  isLoading?: boolean
  isSubmitting?: boolean
  onSubmit: (values: SystemSettingsFormOutput) => Promise<void>
}

const defaultValues: SystemSettingsFormInput = {
  currency: 'GHS',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  themeMode: 'system',
  numbering: {
    receiptPrefix: 'NAK',
    receiptFormat: 'NAK-{year}-{sequence}',
    customerPrefix: 'CUS',
    customerFormat: 'CUS-{sequence}',
    supplierPrefix: 'SUP',
    supplierFormat: 'SUP-{sequence}',
    productPrefix: 'PRD',
    productFormat: 'PRD-{sequence}',
    warehousePrefix: 'WH',
    warehouseFormat: 'WH-{sequence}',
  },
}

export function SystemPreferencesForm({
  settings,
  isLoading,
  isSubmitting,
  onSubmit,
}: SystemPreferencesFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemSettingsFormInput, unknown, SystemSettingsFormOutput>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (settings) {
      reset({
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        themeMode: settings.themeMode,
        numbering: settings.numbering,
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
          <CardTitle>Regional Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select id="currency" {...register('currency')}>
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select id="dateFormat" {...register('dateFormat')}>
              {Object.entries(DATE_FORMAT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeFormat">Time Format</Label>
            <Select id="timeFormat" {...register('timeFormat')}>
              {Object.entries(TIME_FORMAT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="themeMode">Theme Mode</Label>
            <Select id="themeMode" {...register('themeMode')}>
              {Object.entries(THEME_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Numbering Sequences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure code formats for receipts, customers, suppliers, products, and warehouses.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="numbering.receiptFormat">Receipt Numbers</Label>
            <Input id="numbering.receiptFormat" {...register('numbering.receiptFormat')} />
            <p className="text-xs text-muted-foreground">Example: NAK-2026-000001</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numbering.customerFormat">Customer Codes</Label>
            <Input id="numbering.customerFormat" {...register('numbering.customerFormat')} />
            <p className="text-xs text-muted-foreground">Example: CUS-000001</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numbering.supplierFormat">Supplier Codes</Label>
            <Input id="numbering.supplierFormat" {...register('numbering.supplierFormat')} />
            <p className="text-xs text-muted-foreground">Example: SUP-000001</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numbering.productFormat">Product Codes</Label>
            <Input id="numbering.productFormat" {...register('numbering.productFormat')} />
            <p className="text-xs text-muted-foreground">Example: PRD-000001</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="numbering.warehouseFormat">Warehouse Codes</Label>
            <Input id="numbering.warehouseFormat" {...register('numbering.warehouseFormat')} />
            <p className="text-xs text-muted-foreground">Example: WH-001</p>
          </div>
          {errors.numbering ? (
            <p className="text-sm text-destructive md:col-span-2">
              Please check numbering format fields.
            </p>
          ) : null}
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
