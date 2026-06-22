import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from '@/features/products/schemas/product.schema'
import type { Category, Product } from '@/features/products/types'

interface ProductFormProps {
  categories: Category[]
  product?: Product | null
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: ProductFormOutput) => Promise<void>
}

const defaultValues: ProductFormInput = {
  name: '',
  categoryId: '',
  brand: '',
  model: '',
  sku: '',
  description: '',
  warrantyMonths: 12,
  imageUrl: '',
  isActive: 'true',
}

export function ProductForm({
  categories,
  product,
  isSubmitting = false,
  submitLabel = 'Save product',
  onSubmit,
}: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        categoryId: product.categoryId,
        brand: product.brand,
        model: product.model,
        sku: product.sku,
        description: product.description,
        warrantyMonths: product.warrantyMonths,
        imageUrl: product.imageUrl,
        isActive: product.isActive ? 'true' : 'false',
      })
      setImagePreview(product.imageUrl)
      return
    }

    reset({
      ...defaultValues,
      categoryId: categories[0]?.id ?? '',
    })
    setImagePreview('')
  }, [product, categories, reset])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setValue('imageUrl', result, { shouldDirty: true })
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the core product details for your catalog.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select id="categoryId" {...register('categoryId')}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId ? (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input id="brand" {...register('brand')} />
              {errors.brand ? <p className="text-sm text-destructive">{errors.brand.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyMonths">Warranty Months</Label>
              <Input id="warrantyMonths" type="number" min="0" {...register('warrantyMonths')} />
              {errors.warrantyMonths ? (
                <p className="text-sm text-destructive">{errors.warrantyMonths.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select id="isActive" {...register('isActive')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register('description')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Image</CardTitle>
          <CardDescription>Upload a product image for listings and detail pages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Product preview"
                className="h-28 w-28 rounded-lg border object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
                No image
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="imageUpload">Product Image Upload</Label>
              <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} />
              <p className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
