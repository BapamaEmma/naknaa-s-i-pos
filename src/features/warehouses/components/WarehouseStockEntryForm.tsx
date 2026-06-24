import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  warehouseStockEntrySchema,
  type WarehouseStockEntryFormInput,
  type WarehouseStockEntryFormOutput,
} from '@/features/warehouses/schemas/warehouse.schema'
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses'
import { useBrands, useProducts } from '@/features/products/hooks/use-products'
import { useInventoryVariants } from '@/features/inventory/hooks/use-inventory'

interface WarehouseStockEntryFormProps {
  defaultWarehouseId?: string
  isSubmitting?: boolean
  onSubmit: (values: WarehouseStockEntryFormOutput) => Promise<void>
}

export function WarehouseStockEntryForm({
  defaultWarehouseId,
  isSubmitting = false,
  onSubmit,
}: WarehouseStockEntryFormProps) {
  const { data: warehousesData } = useWarehouses({ page: 1, limit: 100, status: 'active' })
  const warehouses = warehousesData?.data ?? []
  const { data: productsData } = useProducts({ page: 1, limit: 200, status: 'active' })
  const products = productsData?.data ?? []
  const { data: brands = [] } = useBrands()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WarehouseStockEntryFormInput, unknown, WarehouseStockEntryFormOutput>({
    resolver: zodResolver(warehouseStockEntrySchema),
    defaultValues: {
      warehouseId: defaultWarehouseId ?? '',
      productName: '',
      brand: '',
      color: '',
      quantity: 1,
      notes: '',
    },
  })

  const productName = watch('productName')
  const brand = watch('brand')

  const matchedProduct = useMemo(() => {
    const normalizedName = productName.trim().toLowerCase()
    const normalizedBrand = brand.trim().toLowerCase()

    if (!normalizedName) return undefined

    return (
      products.find(
        (product) =>
          product.name.toLowerCase() === normalizedName &&
          product.brand.toLowerCase() === normalizedBrand,
      ) ??
      products.find((product) => product.name.toLowerCase() === normalizedName)
    )
  }, [products, productName, brand])

  const { data: variants = [] } = useInventoryVariants(matchedProduct?.id)

  const handleCatalogSelect = (productId: string) => {
    const product = products.find((entry) => entry.id === productId)
    if (!product) return

    setValue('productName', product.name, { shouldValidate: true })
    setValue('brand', product.brand, { shouldValidate: true })
    setValue('color', '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Stocks to Warehouse</CardTitle>
          <CardDescription>
            Choose which warehouse holds the item, then enter the name, brand, color, and quantity. No shelf or bin
            location is required — the system tracks stock by warehouse only.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="warehouseId">Warehouse *</Label>
            <Select id="warehouseId" {...register('warehouseId')}>
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName} ({warehouse.warehouseCode})
                </option>
              ))}
            </Select>
            {errors.warehouseId ? (
              <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="catalogProduct">Select from Catalog (optional)</Label>
            <Select
              id="catalogProduct"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  handleCatalogSelect(event.target.value)
                }
              }}
            >
              <option value="">Choose a product to auto-fill details</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.brand}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Item Name *</Label>
            <Input
              id="productName"
              list="warehouse-product-names"
              placeholder="e.g. Fender Stratocaster"
              {...register('productName')}
            />
            <datalist id="warehouse-product-names">
              {products.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.brand}
                </option>
              ))}
            </datalist>
            {errors.productName ? (
              <p className="text-sm text-destructive">{errors.productName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Input id="brand" list="warehouse-brands" placeholder="e.g. Fender" {...register('brand')} />
            <datalist id="warehouse-brands">
              {brands.map((entry) => (
                <option key={entry.value} value={entry.value} />
              ))}
            </datalist>
            {errors.brand ? <p className="text-sm text-destructive">{errors.brand.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            {variants.length > 0 ? (
              <Select
                id="color"
                {...register('color')}
                onChange={(event) => setValue('color', event.target.value, { shouldValidate: true })}
              >
                <option value="">Select color</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.name}>
                    {variant.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Input id="color" placeholder="e.g. Black (optional)" {...register('color')} />
            )}
            {errors.color ? <p className="text-sm text-destructive">{errors.color.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" type="number" min={1} {...register('quantity')} />
            {errors.quantity ? (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Optional notes..." {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <PackagePlus className="h-4 w-4" />
          {isSubmitting ? 'Saving stocks...' : 'Add Stocks to Warehouse'}
        </Button>
      </div>
    </form>
  )
}
