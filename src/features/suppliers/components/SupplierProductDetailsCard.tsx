import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SupplierProductDetail } from '@/features/suppliers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SupplierProductDetailsCardProps {
  product: SupplierProductDetail
}

export function SupplierProductDetailsCard({ product }: SupplierProductDetailsCardProps) {
  const fields = [
    { label: 'Supplier Name', value: product.supplierName },
    { label: 'Product Name', value: product.productName },
    { label: 'Product Variant', value: product.variantName },
    { label: 'Quantity Supplied', value: product.quantitySupplied },
    { label: 'Cost Price', value: formatCurrency(product.costPrice) },
    { label: 'Total Cost', value: formatCurrency(product.totalCost) },
    { label: 'Date Supplied', value: formatDate(product.dateSupplied) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supply Record</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{field.label}</p>
            <p className="font-medium">{field.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
