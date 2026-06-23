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
  warehouseFormSchema,
  type WarehouseFormInput,
  type WarehouseFormOutput,
} from '@/features/warehouses/schemas/warehouse.schema'
import { WAREHOUSE_STATUS_LABELS } from '@/features/warehouses/constants'
import type { Warehouse } from '@/features/warehouses/types'

interface WarehouseFormProps {
  warehouse?: Warehouse
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: WarehouseFormOutput) => Promise<void>
}

export function WarehouseForm({
  warehouse,
  isSubmitting = false,
  submitLabel = 'Save warehouse',
  onSubmit,
}: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormInput, unknown, WarehouseFormOutput>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      warehouseName: '',
      description: '',
      address: '',
      manager: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (warehouse) {
      reset({
        warehouseName: warehouse.warehouseName,
        description: warehouse.description,
        address: warehouse.address,
        manager: warehouse.manager,
        status: warehouse.status,
      })
    }
  }, [warehouse, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Information</CardTitle>
          <CardDescription>Create or update warehouse details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="warehouseName">Warehouse Name *</Label>
            <Input id="warehouseName" {...register('warehouseName')} />
            {errors.warehouseName ? (
              <p className="text-sm text-destructive">{errors.warehouseName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Input id="manager" {...register('manager')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('status')}>
              {Object.entries(WAREHOUSE_STATUS_LABELS).map(([value, label]) => (
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
