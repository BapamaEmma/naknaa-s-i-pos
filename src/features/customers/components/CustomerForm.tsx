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
import {
  customerFormSchema,
  type CustomerFormInput,
  type CustomerFormOutput,
} from '@/features/customers/schemas/customer.schema'
import type { Customer } from '@/features/customers/types'

interface CustomerFormProps {
  customer?: Customer
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: CustomerFormOutput) => Promise<void>
}

export function CustomerForm({
  customer,
  isSubmitting = false,
  submitLabel = 'Save customer',
  onSubmit,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormInput, unknown, CustomerFormOutput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      city: '',
      notes: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (customer) {
      reset({
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        notes: customer.notes,
        status: customer.status,
      })
    }
  }, [customer, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the customer contact and profile details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName ? (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input id="phoneNumber" {...register('phoneNumber')} placeholder="+233 XX XXX XXXX" />
            {errors.phoneNumber ? (
              <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Regular customer, wholesale buyer, VIP customer..."
              {...register('notes')}
            />
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
