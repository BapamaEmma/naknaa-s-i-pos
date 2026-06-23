import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  supplierFormSchema,
  type SupplierFormInput,
  type SupplierFormOutput,
} from '@/features/suppliers/schemas/supplier.schema'
import type { Supplier } from '@/features/suppliers/types'

interface SupplierFormProps {
  supplier?: Supplier
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: SupplierFormOutput) => Promise<void>
}

export function SupplierForm({
  supplier,
  isSubmitting = false,
  submitLabel = 'Save supplier',
  onSubmit,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormInput, unknown, SupplierFormOutput>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      storeName: '',
      suppliedToPerson: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      notes: '',
      isActive: 'true',
    },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        storeName: supplier.storeName,
        suppliedToPerson: supplier.suppliedToPerson,
        email: supplier.email,
        phoneNumber: supplier.phoneNumber,
        address: supplier.address,
        city: supplier.city,
        notes: supplier.notes,
        isActive: supplier.isActive ? 'true' : 'false',
      })
    }
  }, [supplier, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
          <CardDescription>Enter supplier contact and profile details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Supplier Name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeName">Supplier Store Name</Label>
            <Input id="storeName" placeholder="e.g. JBL Ghana Showroom" {...register('storeName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suppliedToPerson">Person We Supply To</Label>
            <Input
              id="suppliedToPerson"
              placeholder="Name of person who receives the items"
              {...register('suppliedToPerson')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" {...register('phoneNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select id="isActive" {...register('isActive')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
