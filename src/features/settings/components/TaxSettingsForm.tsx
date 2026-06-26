import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  taxFormSchema,
  type TaxFormInput,
  type TaxFormOutput,
} from '@/features/settings/schemas/settings.schema'
import type { TaxConfiguration, TaxSettings } from '@/features/settings/types'

interface TaxSettingsFormProps {
  settings?: TaxSettings
  isLoading?: boolean
  isSubmitting?: boolean
  onCreate: (values: TaxFormOutput) => Promise<void>
  onUpdate: (id: string, values: Partial<TaxFormOutput>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const defaultValues: TaxFormInput = {
  taxName: '',
  taxPercentage: 0,
  enabled: true,
}

export function TaxSettingsForm({
  settings,
  isLoading,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
}: TaxSettingsFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<TaxConfiguration | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaxFormInput, unknown, TaxFormOutput>({
    resolver: zodResolver(taxFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!dialogOpen) {
      reset(defaultValues)
      setEditingTax(null)
      return
    }
    if (editingTax) {
      reset({
        taxName: editingTax.taxName,
        taxPercentage: editingTax.taxPercentage,
        enabled: editingTax.enabled,
      })
    }
  }, [dialogOpen, editingTax, reset])

  const openCreate = () => {
    setEditingTax(null)
    setDialogOpen(true)
  }

  const openEdit = (tax: TaxConfiguration) => {
    setEditingTax(tax)
    setDialogOpen(true)
  }

  const handleFormSubmit = handleSubmit(async (values) => {
    if (editingTax) {
      await onUpdate(editingTax.id, values)
    } else {
      await onCreate(values)
    }
    setDialogOpen(false)
  })

  if (isLoading) {
    return (
      <LoadingSpinner size="lg" layout="form" />
    )
  }

  const taxes = settings?.taxes ?? []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Tax Configurations</CardTitle>
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Tax
          </Button>
        </CardHeader>
        <CardContent>
          {taxes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tax configurations yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Name</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxes.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">{tax.taxName}</TableCell>
                      <TableCell>{tax.taxPercentage}%</TableCell>
                      <TableCell>
                        <Badge variant={tax.enabled ? 'success' : 'secondary'}>
                          {tax.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEdit(tax)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdate(tax.id, { enabled: !tax.enabled })}
                            disabled={isSubmitting}
                          >
                            {tax.enabled ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => onDelete(tax.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{editingTax ? 'Edit Tax' : 'Add Tax'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taxName">Tax Name *</Label>
                <Input id="taxName" placeholder="VAT" {...register('taxName')} />
                {errors.taxName ? (
                  <p className="text-sm text-destructive">{errors.taxName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Tax Percentage *</Label>
                <Input id="taxPercentage" type="number" step="0.1" {...register('taxPercentage')} />
                {errors.taxPercentage ? (
                  <p className="text-sm text-destructive">{errors.taxPercentage.message}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="enabled">Enable Tax</Label>
                <Switch
                  id="enabled"
                  checked={watch('enabled')}
                  onCheckedChange={(checked) => setValue('enabled', checked)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingTax ? 'Update Tax' : 'Create Tax'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
