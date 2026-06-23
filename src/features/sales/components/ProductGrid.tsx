import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { CartItem, PosProductResult } from '@/features/sales/types'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: PosProductResult[]
  cartItems?: CartItem[]
  isLoading?: boolean
  onAddToCart: (product: PosProductResult) => void
}

export function ProductGrid({ products, cartItems = [], isLoading, onAddToCart }: ProductGridProps) {
  const cartQuantityMap = new Map(cartItems.map((item) => [item.productVariantId, item.quantity]))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Products</CardTitle>
        <p className="text-sm text-muted-foreground">Tap a product to add it to the cart.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Package className="h-8 w-8 opacity-50" />
            <p className="text-sm">Search for products to sell.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const outOfStock = product.availableStock <= 0
              const cartQty = cartQuantityMap.get(product.productVariantId) ?? 0
              const atMax = cartQty >= product.availableStock

              return (
                <button
                  key={product.productVariantId}
                  type="button"
                  disabled={outOfStock || atMax}
                  onClick={() => onAddToCart(product)}
                  className={cn(
                    'group relative flex flex-col rounded-xl border bg-card p-3 text-left transition',
                    'hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    cartQty > 0 && 'border-primary ring-1 ring-primary/20',
                  )}
                >
                  {cartQty > 0 ? (
                    <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                      {cartQty}
                    </span>
                  ) : null}

                  <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight">{product.productName}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{product.variantName}</p>
                    <p className="mt-auto pt-2 text-sm font-bold">{formatCurrency(product.sellingPrice)}</p>
                    <Badge
                      variant={outOfStock ? 'destructive' : atMax ? 'warning' : 'secondary'}
                      className="mt-1 w-fit text-[10px]"
                    >
                      {outOfStock
                        ? 'Out of Stock'
                        : atMax
                          ? 'Max in cart'
                          : `${product.availableStock} left`}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
