import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  supplierCreateFormSchema,
  type SupplierCreateFormInput,
  type SupplierCreateFormOutput,
} from '@/features/suppliers/schemas/supplier.schema'
import { useProducts } from '@/features/products/hooks/use-products'

interface SupplierCreateFormProps {
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: SupplierCreateFormOutput) => Promise<void>
}

export function SupplierCreateForm({
  isSubmitting = false,
  submitLabel = 'Save supplier & items',
  onSubmit,
}: SupplierCreateFormProps) {
  const { data: productsData } = useProducts({ page: 1, limit: 200, status: 'active' })
  const products = productsData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SupplierCreateFormInput, unknown, SupplierCreateFormOutput>({
    resolver: zodResolver(supplierCreateFormSchema),
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
      items: [{ productName: '', quantity: 1, color: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

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

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Items Supplied</CardTitle>
            <CardDescription>
              Add all products this supplier delivers. Enter product name and quantity; color is optional.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ productName: '', quantity: 1, color: '' })}
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeof errors.items?.message === 'string' ? (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          ) : null}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Item {index + 1}</p>
                {fields.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.productName`}>Product Name *</Label>
                  <Input
                    id={`items.${index}.productName`}
                    list="supplier-product-names"
                    placeholder="e.g. Fender Stratocaster"
                    {...register(`items.${index}.productName`)}
                  />
                  {errors.items?.[index]?.productName ? (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.productName?.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                  <Input
                    id={`items.${index}.quantity`}
                    type="number"
                    min={1}
                    {...register(`items.${index}.quantity`)}
                  />
                  {errors.items?.[index]?.quantity ? (
                    <p className="text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.color`}>Color (optional)</Label>
                  <Input
                    id={`items.${index}.color`}
                    placeholder="e.g. Black (leave blank if not applicable)"
                    {...register(`items.${index}.color`)}
                  />
                  {errors.items?.[index]?.color ? (
                    <p className="text-sm text-destructive">{errors.items[index]?.color?.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          <datalist id="supplier-product-names">
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.brand}
              </option>
            ))}
          </datalist>
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
