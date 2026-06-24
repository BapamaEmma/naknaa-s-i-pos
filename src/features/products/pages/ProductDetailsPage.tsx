import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { InventorySummaryCards } from '@/features/products/components/InventorySummaryCards'
import { PageHeader } from '@/features/products/components/PageHeader'
import { ProductInfoCard } from '@/features/products/components/ProductInfoCard'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import { useProduct } from '@/features/products/hooks/use-products'

export function ProductDetailsPage() {
  const { id = '' } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Product not found.</p>
        <Button asChild variant="outline">
          <Link to={PRODUCT_ROUTES.LIST}>Back to products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={product.name}
        description="View product information and inventory summary."
        backTo={PRODUCT_ROUTES.LIST}
        backLabel="Back to products"
        action={
          <Button asChild>
            <Link to={PRODUCT_ROUTES.EDIT(id)}>
              <Pencil className="h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        }
      />

      <ProductInfoCard product={product} />
      <InventorySummaryCards summary={product.inventorySummary} />
    </div>
  )
}
