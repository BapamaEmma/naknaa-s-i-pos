import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  warehouseFormSchema,
  type WarehouseFormInput,
  type WarehouseFormOutput,
} from '@/features/settings/schemas/settings.schema'
import { SETTINGS_STATUS_LABELS } from '@/features/settings/constants'
import type { SettingsWarehouse } from '@/features/settings/types'

interface WarehouseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse?: SettingsWarehouse | null
  isSubmitting?: boolean
  onSubmit: (values: WarehouseFormOutput) => Promise<void>
}

const defaultValues: WarehouseFormInput = {
  warehouseName: '',
  description: '',
  address: '',
  manager: '',
  status: 'active',
}

export function WarehouseFormDialog({
  open,
  onOpenChange,
  warehouse,
  isSubmitting,
  onSubmit,
}: WarehouseFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormInput, unknown, WarehouseFormOutput>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      return
    }
    if (warehouse) {
      reset({
        warehouseName: warehouse.warehouseName,
        description: warehouse.description,
        address: warehouse.address,
        manager: warehouse.manager,
        status: warehouse.status,
      })
      return
    }
    reset(defaultValues)
  }, [open, warehouse, reset])

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>{warehouse ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
            <DialogDescription>
              {warehouse ? 'Update warehouse details and status.' : 'Add a new warehouse location.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseName">Warehouse Name *</Label>
              <Input id="warehouseName" {...register('warehouseName')} />
              {errors.warehouseName ? (
                <p className="text-sm text-destructive">{errors.warehouseName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...register('address')} />
              {errors.address ? (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager *</Label>
              <Input id="manager" {...register('manager')} />
              {errors.manager ? (
                <p className="text-sm text-destructive">{errors.manager.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register('status')}>
                {Object.entries(SETTINGS_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : warehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
