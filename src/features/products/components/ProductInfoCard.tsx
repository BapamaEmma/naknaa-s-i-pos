import { Link } from 'react-router-dom'
import { AlertCircle, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import {
  formatPriceRange,
  getProductPricingSummary,
} from '@/features/products/utils/pricing'
import type { ProductDetail } from '@/features/products/types'

interface ProductInfoCardProps {
  product: ProductDetail
}

export function ProductInfoCard({ product }: ProductInfoCardProps) {
  const pricing = getProductPricingSummary(product.variants)

  const fields = [
    { label: 'Product Name', value: product.name },
    { label: 'Category', value: product.categoryName },
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model || '—' },
    { label: 'SKU', value: product.sku || '—' },
    { label: 'Warranty', value: `${product.warrantyMonths} months` },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Product Information</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Core product details and metadata.</p>
        </div>
        <Badge variant={product.isActive ? 'success' : 'secondary'}>
          {product.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-32 w-32 rounded-lg border object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
              No image
            </div>
          )}

          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</p>
                <p className="mt-1 text-sm font-medium">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pricing</p>
          {pricing ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Cost Price</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatPriceRange(pricing.costPrice.min, pricing.costPrice.max)}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Selling Price</p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  {formatPriceRange(pricing.sellingPrice.min, pricing.sellingPrice.max)}
                </p>
              </div>
              {pricing.isSingle && pricing.singleVariant ? (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Based on variant: {pricing.singleVariant.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Price range across {product.variants.length} variants
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">No price set</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a variant with cost and selling prices to sell this product.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link to={PRODUCT_ROUTES.EDIT(product.id)}>
                  <Plus className="h-4 w-4" />
                  Add pricing
                </Link>
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {product.description || 'No description provided.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
