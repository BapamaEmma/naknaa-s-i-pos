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
import { useServices, useTechnicians } from '@/features/services/hooks/use-services'
import {
  serviceJobFormSchema,
  type ServiceJobFormInput,
  type ServiceJobFormOutput,
} from '@/features/services/schemas/service.schema'
import { customerService } from '@/services/customers/customerService'

interface ServiceJobFormProps {
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: ServiceJobFormOutput) => Promise<void>
}

export function ServiceJobForm({
  isSubmitting = false,
  submitLabel = 'Create service job',
  onSubmit,
}: ServiceJobFormProps) {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, 'options'],
    queryFn: () => customerService.getCustomerOptions(),
  })
  const { data: servicesData, isLoading: servicesLoading } = useServices({
    page: 1,
    limit: 100,
    status: 'active',
  })
  const { data: technicians = [], isLoading: techniciansLoading } = useTechnicians()

  const services = servicesData?.data ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceJobFormInput, unknown, ServiceJobFormOutput>({
    resolver: zodResolver(serviceJobFormSchema),
    defaultValues: {
      customerId: '',
      serviceId: '',
      technicianId: '',
      serviceDate: '',
      expectedCompletionDate: '',
      amount: 0,
      notes: '',
    },
  })

  const serviceId = watch('serviceId')

  useEffect(() => {
    const selectedService = services.find((service) => service.id === serviceId)
    if (selectedService) {
      setValue('amount', selectedService.standardPrice)
    }
  }, [serviceId, services, setValue])

  const isLoadingOptions = customersLoading || servicesLoading || techniciansLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Job Details</CardTitle>
          <CardDescription>
            Assign a service job to a customer and technician.
          </CardDescription>
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
                {technicians
                  .filter((technician) => technician.status === 'active')
                  .map((technician) => (
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} placeholder="Additional job notes..." {...register('notes')} />
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
