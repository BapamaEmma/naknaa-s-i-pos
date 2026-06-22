import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopPurchasedProduct } from '@/features/customers/types'

interface TopPurchasedProductsProps {
  products: TopPurchasedProduct[]
  title?: string
}

export function TopPurchasedProducts({
  products,
  title = 'Top Products Purchased',
}: TopPurchasedProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchase data available yet.</p>
        ) : (
          <ol className="space-y-3">
            {products.map((product) => (
              <li key={`${product.productName}-${product.variantName}`} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {product.rank}
                </span>
                <div>
                  <p className="font-medium">
                    {product.productName} {product.variantName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Purchased {product.purchaseCount} time{product.purchaseCount === 1 ? '' : 's'}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
