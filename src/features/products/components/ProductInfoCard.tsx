import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ProductDetail } from '@/features/products/types'

interface ProductInfoCardProps {
  product: ProductDetail
}

export function ProductInfoCard({ product }: ProductInfoCardProps) {
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
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {product.description || 'No description provided.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
