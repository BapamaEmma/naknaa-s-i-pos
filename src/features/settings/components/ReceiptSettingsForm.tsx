import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  receiptSettingsSchema,
  type ReceiptSettingsFormInput,
  type ReceiptSettingsFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { BusinessSettings, ReceiptSettings } from '@/features/settings/types'
import { formatCurrency } from '@/lib/format'

interface ReceiptSettingsFormProps {
  settings?: ReceiptSettings
  business?: BusinessSettings
  isLoading?: boolean
  isSubmitting?: boolean
  onSubmit: (values: ReceiptSettingsFormOutput) => Promise<void>
}

const defaultValues: ReceiptSettingsFormInput = {
  receiptHeader: '',
  receiptFooter: '',
  showBusinessLogo: true,
  showCustomerDetails: true,
  showCashierName: true,
  showBranchName: true,
  receiptSize: '80mm',
  receiptNumberPrefix: 'NAK',
  receiptNumberFormat: 'NAK-{year}-{sequence}',
}

function ToggleField({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export function ReceiptSettingsForm({
  settings,
  business,
  isLoading,
  isSubmitting,
  onSubmit,
}: ReceiptSettingsFormProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReceiptSettingsFormInput, unknown, ReceiptSettingsFormOutput>({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues,
  })

  const values = watch()

  useEffect(() => {
    if (settings) {
      reset({
        receiptHeader: settings.receiptHeader,
        receiptFooter: settings.receiptFooter,
        showBusinessLogo: settings.showBusinessLogo,
        showCustomerDetails: settings.showCustomerDetails,
        showCashierName: settings.showCashierName,
        showBranchName: settings.showBranchName,
        receiptSize: settings.receiptSize,
        receiptNumberPrefix: settings.receiptNumberPrefix,
        receiptNumberFormat: settings.receiptNumberFormat,
      })
    }
  }, [settings, reset])

  if (isLoading) {
    return (
      <LoadingSpinner size="lg" layout="form" />
    )
  }

  const previewWidth = values.receiptSize === '58mm' ? 'max-w-[58mm]' : 'max-w-[80mm]'

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Receipt Layout</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="receiptHeader">Receipt Header *</Label>
              <Input id="receiptHeader" {...register('receiptHeader')} />
              {errors.receiptHeader ? (
                <p className="text-sm text-destructive">{errors.receiptHeader.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Textarea id="receiptFooter" rows={2} {...register('receiptFooter')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptSize">Receipt Size</Label>
              <Select id="receiptSize" {...register('receiptSize')}>
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptNumberFormat">Receipt Number Format</Label>
              <Input id="receiptNumberFormat" {...register('receiptNumberFormat')} />
              <p className="text-xs text-muted-foreground">Example: NAK-2026-000001</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ToggleField
              id="showBusinessLogo"
              label="Show Business Logo"
              checked={values.showBusinessLogo}
              onCheckedChange={(checked) => setValue('showBusinessLogo', checked)}
            />
            <ToggleField
              id="showCustomerDetails"
              label="Show Customer Details"
              checked={values.showCustomerDetails}
              onCheckedChange={(checked) => setValue('showCustomerDetails', checked)}
            />
            <ToggleField
              id="showCashierName"
              label="Show Cashier Name"
              checked={values.showCashierName}
              onCheckedChange={(checked) => setValue('showCashierName', checked)}
            />
            <ToggleField
              id="showBranchName"
              label="Show Branch Name"
              checked={values.showBranchName}
              onCheckedChange={(checked) => setValue('showBranchName', checked)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" />
            Preview Receipt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div
            className={`mx-auto bg-white p-4 font-mono text-sm text-black ${previewWidth}`}
          >
            <div className="space-y-2 border-b border-dashed border-black pb-4 text-center">
              {values.showBusinessLogo && business?.businessLogo ? (
                <img src={business.businessLogo} alt="Logo" className="mx-auto h-12 object-contain" />
              ) : null}
              <p className="text-lg font-bold uppercase">{values.receiptHeader}</p>
              <p className="text-xs">NAK-2026-000001</p>
            </div>
            {values.showBranchName ? (
              <p className="py-2 text-center text-xs">Accra Branch</p>
            ) : null}
            {values.showCustomerDetails ? (
              <p className="py-1 text-xs">Customer: Walk-In Customer</p>
            ) : null}
            {values.showCashierName ? (
              <p className="py-1 text-xs">Cashier: Demo Cashier</p>
            ) : null}
            <div className="border-y border-dashed border-black py-3 text-xs">
              <div className="flex justify-between">
                <span>Sample Product</span>
                <span>{formatCurrency(250)}</span>
              </div>
            </div>
            <div className="flex justify-between py-3 font-bold">
              <span>Total</span>
              <span>{formatCurrency(250)}</span>
            </div>
            <p className="border-t border-dashed border-black pt-3 text-center text-xs">
              {values.receiptFooter}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
