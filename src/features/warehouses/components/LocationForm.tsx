import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  locationFormSchema,
  type LocationFormInput,
  type LocationFormOutput,
} from '@/features/warehouses/schemas/warehouse.schema'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'
import type { WarehouseLocation } from '@/features/warehouses/types'

interface LocationFormProps {
  location?: WarehouseLocation
  defaultWarehouseId?: string
  isSubmitting?: boolean
  onSubmit: (values: LocationFormOutput) => Promise<void>
  onCancel?: () => void
}

export function LocationForm({
  location,
  defaultWarehouseId,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: LocationFormProps) {
  const { data: warehousesData } = useWarehouses({ page: 1, limit: 100, status: 'all' })
  const warehouses = warehousesData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationFormInput, unknown, LocationFormOutput>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      warehouseId: defaultWarehouseId ?? '',
      section: '',
      rack: '',
      bin: '',
      description: '',
    },
  })

  useEffect(() => {
    if (location) {
      reset({
        warehouseId: location.warehouseId,
        section: location.section,
        rack: location.rack,
        bin: location.bin,
        description: location.description,
      })
    } else if (defaultWarehouseId) {
      reset((current) => ({ ...current, warehouseId: defaultWarehouseId }))
    }
  }, [location, defaultWarehouseId, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{location ? 'Edit Location' : 'Add Location'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="warehouseId">Warehouse *</Label>
            <Select id="warehouseId" {...register('warehouseId')}>
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
            {errors.warehouseId ? (
              <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Input id="section" {...register('section')} placeholder="Speakers" />
            {errors.section ? <p className="text-sm text-destructive">{errors.section.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rack">Rack *</Label>
            <Input id="rack" {...register('rack')} placeholder="A-01" />
            {errors.rack ? <p className="text-sm text-destructive">{errors.rack.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bin">Bin *</Label>
            <Input id="bin" {...register('bin')} placeholder="B-05" />
            {errors.bin ? <p className="text-sm text-destructive">{errors.bin.message}</p> : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Location'}
        </Button>
      </div>
    </form>
  )
}
