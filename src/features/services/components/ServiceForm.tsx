import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SERVICE_STATUS_LABELS } from '@/features/services/constants'
import { useServiceCategories } from '@/features/services/hooks/use-services'
import {
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormOutput,
} from '@/features/services/schemas/service.schema'
import type { Service } from '@/features/services/types'

interface ServiceFormProps {
  service?: Service
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: ServiceFormOutput) => Promise<void>
}

export function ServiceForm({
  service,
  isSubmitting = false,
  submitLabel = 'Save service',
  onSubmit,
}: ServiceFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useServiceCategories()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormInput, unknown, ServiceFormOutput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceName: '',
      categoryId: '',
      description: '',
      standardPrice: 0,
      status: 'active',
    },
  })

  useEffect(() => {
    if (service) {
      reset({
        serviceName: service.serviceName,
        categoryId: service.categoryId,
        description: service.description,
        standardPrice: service.standardPrice,
        status: service.status,
      })
    }
  }, [service, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Define the service details, pricing, and availability.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input id="serviceName" placeholder="Screen Replacement" {...register('serviceName')} />
            {errors.serviceName ? (
              <p className="text-sm text-destructive">{errors.serviceName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            {categoriesLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Select id="categoryId" {...register('categoryId')}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </Select>
            )}
            {errors.categoryId ? (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="standardPrice">Standard Price *</Label>
            <Input id="standardPrice" type="number" step="0.01" min="0" {...register('standardPrice')} />
            {errors.standardPrice ? (
              <p className="text-sm text-destructive">{errors.standardPrice.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register('description')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('status')}>
              {Object.entries(SERVICE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
