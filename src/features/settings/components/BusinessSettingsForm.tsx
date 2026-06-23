import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  businessSettingsSchema,
  type BusinessSettingsFormInput,
  type BusinessSettingsFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { BusinessSettings } from '@/features/settings/types'

interface BusinessSettingsFormProps {
  settings?: BusinessSettings
  isLoading?: boolean
  isSubmitting?: boolean
  onSubmit: (values: BusinessSettingsFormOutput) => Promise<void>
}

const defaultValues: BusinessSettingsFormInput = {
  businessName: '',
  businessLogo: null,
  businessPhone: '',
  alternatePhone: '',
  emailAddress: '',
  website: '',
  businessAddress: '',
  city: '',
  country: '',
  taxIdentificationNumber: '',
}

export function BusinessSettingsForm({
  settings,
  isLoading,
  isSubmitting,
  onSubmit,
}: BusinessSettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessSettingsFormInput, unknown, BusinessSettingsFormOutput>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues,
  })

  const logo = watch('businessLogo')

  useEffect(() => {
    if (settings) {
      reset({
        businessName: settings.businessName,
        businessLogo: settings.businessLogo,
        businessPhone: settings.businessPhone,
        alternatePhone: settings.alternatePhone,
        emailAddress: settings.emailAddress,
        website: settings.website,
        businessAddress: settings.businessAddress,
        city: settings.city,
        country: settings.country,
        taxIdentificationNumber: settings.taxIdentificationNumber,
      })
    }
  }, [settings, reset])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setValue('businessLogo', reader.result as string, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

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
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input id="businessName" {...register('businessName')} />
            {errors.businessName ? (
              <p className="text-sm text-destructive">{errors.businessName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Business Logo</Label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {logo ? (
                <img
                  src={logo}
                  alt="Business logo preview"
                  className="h-20 w-20 rounded-lg border object-contain"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                  No logo
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone *</Label>
            <Input id="businessPhone" {...register('businessPhone')} />
            {errors.businessPhone ? (
              <p className="text-sm text-destructive">{errors.businessPhone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input id="alternatePhone" {...register('alternatePhone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address *</Label>
            <Input id="emailAddress" type="email" {...register('emailAddress')} />
            {errors.emailAddress ? (
              <p className="text-sm text-destructive">{errors.emailAddress.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessAddress">Business Address *</Label>
            <Textarea id="businessAddress" rows={2} {...register('businessAddress')} />
            {errors.businessAddress ? (
              <p className="text-sm text-destructive">{errors.businessAddress.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register('city')} />
            {errors.city ? <p className="text-sm text-destructive">{errors.city.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input id="country" {...register('country')} />
            {errors.country ? (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="taxIdentificationNumber">Tax Identification Number (TIN)</Label>
            <Input id="taxIdentificationNumber" {...register('taxIdentificationNumber')} />
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
