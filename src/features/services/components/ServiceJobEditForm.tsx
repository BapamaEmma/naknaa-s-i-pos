import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { QUERY_KEYS } from '@/constants/api'
import { SERVICE_JOB_STATUS_LABELS } from '@/features/services/constants'
import {
  useServices,
  useTechnicians,
} from '@/features/services/hooks/use-services'
import {
  serviceJobEditFormSchema,
  type ServiceJobEditFormInput,
  type ServiceJobEditFormOutput,
} from '@/features/services/schemas/service.schema'
import type { ServiceJobDetail } from '@/features/services/types'
import { customerService } from '@/services/customers/customerService'

interface ServiceJobEditFormProps {
  job?: ServiceJobDetail
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: ServiceJobEditFormOutput) => Promise<void>
}

export function ServiceJobEditForm({
  job,
  isSubmitting = false,
  submitLabel = 'Update service job',
  onSubmit,
}: ServiceJobEditFormProps) {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, 'options'],
    queryFn: () => customerService.getCustomerOptions(),
  })
  const { data: servicesData, isLoading: servicesLoading } = useServices({
    page: 1,
    limit: 100,
    status: 'all',
  })
  const { data: technicians = [], isLoading: techniciansLoading } = useTechnicians()

  const services = servicesData?.data ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ServiceJobEditFormInput, unknown, ServiceJobEditFormOutput>({
    resolver: zodResolver(serviceJobEditFormSchema),
    defaultValues: {
      customerId: '',
      serviceId: '',
      technicianId: '',
      serviceDate: '',
      expectedCompletionDate: '',
      completionDate: '',
      status: 'pending',
      amount: 0,
      notes: '',
    },
  })

  const serviceId = watch('serviceId')

  useEffect(() => {
    if (job) {
      reset({
        customerId: job.customerId,
        serviceId: job.serviceId,
        technicianId: job.technicianId,
        serviceDate: job.serviceDate,
        expectedCompletionDate: job.expectedCompletionDate,
        completionDate: job.completionDate ?? '',
        status: job.status,
        amount: job.amount,
        notes: job.notes,
      })
    }
  }, [job, reset])

  useEffect(() => {
    if (!job) return
    const selectedService = services.find((service) => service.id === serviceId)
    if (selectedService && serviceId !== job.serviceId) {
      setValue('amount', selectedService.standardPrice)
    }
  }, [serviceId, services, job, setValue])

  const isLoadingOptions = customersLoading || servicesLoading || techniciansLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Service Job</CardTitle>
          <CardDescription>Update job assignment, schedule, status, and pricing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            {customersLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Select id="customerId" {...register('customerId')}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </Select>
            )}
            {errors.customerId ? (
              <p className="text-sm text-destructive">{errors.customerId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service *</Label>
            {servicesLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Select id="serviceId" {...register('serviceId')}>
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.serviceName} — {service.categoryName}
                  </option>
                ))}
              </Select>
            )}
            {errors.serviceId ? (
              <p className="text-sm text-destructive">{errors.serviceId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="technicianId">Technician *</Label>
            {techniciansLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Select id="technicianId" {...register('technicianId')}>
                <option value="">Select technician</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} — {technician.specialization}
                  </option>
                ))}
              </Select>
            )}
            {errors.technicianId ? (
              <p className="text-sm text-destructive">{errors.technicianId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
            {errors.amount ? (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceDate">Service Date *</Label>
            <Input id="serviceDate" type="date" {...register('serviceDate')} />
            {errors.serviceDate ? (
              <p className="text-sm text-destructive">{errors.serviceDate.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedCompletionDate">Expected Completion Date *</Label>
            <Input id="expectedCompletionDate" type="date" {...register('expectedCompletionDate')} />
            {errors.expectedCompletionDate ? (
              <p className="text-sm text-destructive">{errors.expectedCompletionDate.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="completionDate">Completion Date</Label>
            <Input id="completionDate" type="date" {...register('completionDate')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select id="status" {...register('status')}>
              {Object.entries(SERVICE_JOB_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {errors.status ? (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || isLoadingOptions}>
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
