import { Package, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { PosProductResult } from '@/features/sales/types'
import { formatCurrency } from '@/lib/format'

interface ProductResultsProps {
  products: PosProductResult[]
  isLoading?: boolean
  onAddToCart: (product: PosProductResult) => void
}

export function ProductResults({ products, isLoading, onAddToCart }: ProductResultsProps) {
  return (
    <Card className="flex min-h-[320px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Product Results</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Package className="h-8 w-8 opacity-50" />
            <p className="text-sm">Search for products to add to the cart.</p>
          </div>
        ) : (
          products.map((product) => {
            const outOfStock = product.availableStock <= 0

            return (
              <div
                key={product.productVariantId}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(product.sellingPrice)}</span>
                      <Badge variant={outOfStock ? 'destructive' : 'secondary'}>
                        {outOfStock ? 'Out of Stock' : `${product.availableStock} in stock`}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={outOfStock}
                  onClick={() => onAddToCart(product)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add To Cart
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
