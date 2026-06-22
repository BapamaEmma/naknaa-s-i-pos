import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye,
  Layers3,
  MoreHorizontal,
  Package,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ProductDetailsDialog } from '@/features/products/components/ProductDetailsDialog'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import type { ProductListItem, ProductListResult } from '@/features/products/types'

interface ProductGridProps {
  data?: ProductListResult
  isLoading: boolean
  onDelete: (product: ProductListItem) => void
}

function ProductImage({
  product,
  onClick,
}: {
  product: ProductListItem
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square w-full overflow-hidden rounded-t-xl bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={`View details for ${product.name}`}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/60 text-muted-foreground">
          <Package className="h-10 w-10 opacity-60" />
          <span className="text-xs font-medium uppercase tracking-wide">{product.brand}</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-sm font-medium text-white">View details</span>
      </div>
    </button>
  )
}

export function ProductGrid({ data, isLoading, onDelete }: ProductGridProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const openDetails = (productId: string) => {
    setSelectedProductId(productId)
    setDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <Package className="mb-3 h-10 w-10 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or add a new product to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.data.map((product) => (
          <Card key={product.id} className="overflow-hidden pt-0 shadow-sm">
            <div className="relative">
              <ProductImage product={product} onClick={() => openDetails(product.id)} />
              <div className="absolute right-2 top-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 shadow-sm backdrop-blur"
                      aria-label={`Actions for ${product.name}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => openDetails(product.id)}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={PRODUCT_ROUTES.EDIT(product.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={PRODUCT_ROUTES.VARIANTS(product.id)}>
                        <Layers3 className="h-4 w-4" />
                        Manage Variants
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardContent className="space-y-2 px-4 pb-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openDetails(product.id)}
                  className="text-left hover:underline focus:outline-none focus:underline"
                >
                  <h3 className="line-clamp-2 font-semibold leading-snug">{product.name}</h3>
                </button>
                <Badge variant={product.isActive ? 'success' : 'secondary'} className="shrink-0">
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{product.categoryName}</p>
              <p className="text-sm">
                <span className="text-muted-foreground">Brand:</span> {product.brand}
              </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <span>{product.variantCount} variant{product.variantCount === 1 ? '' : 's'}</span>
              <span className="truncate">{product.sku}</span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <ProductDetailsDialog
        productId={selectedProductId}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) setSelectedProductId(null)
        }}
      />
    </>
  )
}
