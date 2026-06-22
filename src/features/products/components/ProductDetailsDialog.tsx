import { Link } from 'react-router-dom'
import { ExternalLink, Layers3, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { InventorySummaryCards } from '@/features/products/components/InventorySummaryCards'
import { ProductInfoCard } from '@/features/products/components/ProductInfoCard'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useProduct } from '@/features/products/hooks/use-products'
import { formatCurrency } from '@/lib/format'

interface ProductDetailsDialogProps {
  productId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailsDialog({
  productId,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const { data: product, isLoading, isError } = useProduct(open ? productId ?? undefined : undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError || !product ? (
          <>
            <DialogHeader>
              <DialogTitle>Product not found</DialogTitle>
              <DialogDescription>
                This product may have been removed or is no longer available.
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>
                {product.brand} · {product.categoryName} · {product.sku}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <ProductInfoCard product={product} />
              <InventorySummaryCards summary={product.inventorySummary} />

              {product.variants.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Variants</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variant</TableHead>
                          <TableHead>Selling Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((variant) => (
                          <TableRow key={variant.id}>
                            <TableCell className="font-medium">{variant.name}</TableCell>
                            <TableCell>{formatCurrency(variant.sellingPrice)}</TableCell>
                            <TableCell>{variant.currentStock}</TableCell>
                            <TableCell>
                              <Badge variant={variant.isActive ? 'success' : 'secondary'}>
                                {variant.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" asChild>
                <Link to={PRODUCT_ROUTES.VARIANTS(product.id)} onClick={() => onOpenChange(false)}>
                  <Layers3 className="h-4 w-4" />
                  Manage Variants
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={PRODUCT_ROUTES.EDIT(product.id)} onClick={() => onOpenChange(false)}>
                  <Pencil className="h-4 w-4" />
                  Edit Product
                </Link>
              </Button>
              <Button asChild>
                <Link to={PRODUCT_ROUTES.DETAIL(product.id)} onClick={() => onOpenChange(false)}>
                  <ExternalLink className="h-4 w-4" />
                  Full Details Page
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
