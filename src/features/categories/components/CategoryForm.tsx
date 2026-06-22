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
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormOutput,
} from '@/features/categories/schemas/category.schema'
import type { Category } from '@/features/categories/types'

interface CategoryFormProps {
  category?: Category | null
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: CategoryFormOutput) => Promise<void>
}

const defaultValues: CategoryFormInput = {
  name: '',
  description: '',
  isActive: 'true',
}

export function CategoryForm({
  category,
  isSubmitting = false,
  submitLabel = 'Save category',
  onSubmit,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description,
        isActive: category.isActive ? 'true' : 'false',
      })
      return
    }

    reset(defaultValues)
  }, [category, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Define the category name, description, and availability status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input id="name" placeholder="Speakers" {...register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the types of products in this category."
              {...register('description')}
            />
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
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
