import { Link } from 'react-router-dom'
import { ExternalLink, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { InventorySummaryCards } from '@/features/products/components/InventorySummaryCards'
import { ProductInfoCard } from '@/features/products/components/ProductInfoCard'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useProduct } from '@/features/products/hooks/use-products'

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
            <LoadingSpinner size="lg" layout="table" />
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
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
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
