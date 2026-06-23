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
import { SERVICE_STATUS_LABELS } from '@/features/services/constants'
import {
  serviceCategoryFormSchema,
  type ServiceCategoryFormInput,
  type ServiceCategoryFormOutput,
} from '@/features/services/schemas/service.schema'
import type { ServiceCategory } from '@/features/services/types'

interface ServiceCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ServiceCategory | null
  isSubmitting?: boolean
  onSubmit: (values: ServiceCategoryFormOutput) => Promise<void>
}

const defaultValues: ServiceCategoryFormInput = {
  categoryName: '',
  description: '',
  status: 'active',
}

export function ServiceCategoryForm({
  open,
  onOpenChange,
  category,
  isSubmitting = false,
  onSubmit,
}: ServiceCategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceCategoryFormInput, unknown, ServiceCategoryFormOutput>({
    resolver: zodResolver(serviceCategoryFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      return
    }

    if (category) {
      reset({
        categoryName: category.categoryName,
        description: category.description,
        status: category.status,
      })
      return
    }

    reset(defaultValues)
  }, [open, category, reset])

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
      onOpenChange(false)
      reset(defaultValues)
    } catch {
      // Error surfaced by parent or mutation state
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>{category ? 'Edit category' : 'Add category'}</DialogTitle>
            <DialogDescription>
              {category
                ? 'Update the category name, description, and status.'
                : 'Create a new service category to organize offerings.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input id="categoryName" placeholder="Repairs" {...register('categoryName')} />
              {errors.categoryName ? (
                <p className="text-sm text-destructive">{errors.categoryName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe the types of services in this category."
                {...register('description')}
              />
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
