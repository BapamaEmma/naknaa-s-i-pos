import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/products/components/PageHeader'
import { ProductDeleteDialog } from '@/features/products/components/ProductDeleteDialog'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { PRODUCT_ROUTES } from '@/features/products/constants'
import {
  useBrands,
  useCategories,
  useProducts,
} from '@/features/products/hooks/use-products'
import type { ProductListFilters, ProductListItem } from '@/features/products/types'

export function ProductListPage() {
  const [filters, setFilters] = useState<ProductListFilters>({
    page: 1,
    limit: 12,
    status: 'active',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null)

  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()
  const { data, isLoading } = useProducts(filters)

  const openDeleteDialog = (product: ProductListItem) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Products"
        description="Manage your electronics catalog and pricing."
        action={
          <Button asChild>
            <Link to={PRODUCT_ROUTES.CREATE}>
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      <ProductFilters
        filters={filters}
        categories={categories}
        brands={brands}
        onChange={setFilters}
      />

      <ProductGrid data={data} isLoading={isLoading} onDelete={openDeleteDialog} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ProductDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} product={selectedProduct} />
    </div>
  )
}
