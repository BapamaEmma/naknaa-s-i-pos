import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/format'
import type { CategoryDetail } from '@/features/categories/types'

interface CategoryDetailsCardProps {
  category: CategoryDetail
}

export function CategoryDetailsCard({ category }: CategoryDetailsCardProps) {
  const fields = [
    { label: 'Category Name', value: category.name },
    { label: 'Description', value: category.description || 'No description provided.' },
    { label: 'Status', value: category.isActive ? 'Active' : 'Inactive' },
    { label: 'Created Date', value: formatDate(category.createdAt) },
    { label: 'Updated Date', value: formatDate(category.updatedAt) },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Category Information</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Overview of this product category.</p>
        </div>
        <Badge variant={category.isActive ? 'success' : 'secondary'}>
          {category.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className={field.label === 'Description' ? 'sm:col-span-2' : ''}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</p>
              <p className="mt-1 text-sm font-medium">{field.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoryProductsListProps {
  categoryName: string
  products: CategoryDetail['products']
}

export function CategoryProductsList({ categoryName, products }: CategoryProductsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products under {categoryName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Products currently assigned to this category.
        </p>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products assigned to this category yet.</p>
        ) : (
          <ul className="space-y-3">
            {products.map((product, index) => (
              <li key={product.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                  <Badge variant={product.isActive ? 'success' : 'secondary'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {index < products.length - 1 ? <Separator className="mt-3" /> : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
