import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierAnalyticsCards } from '@/features/suppliers/components/SupplierAnalyticsCards'
import { SupplierProductDeleteDialog } from '@/features/suppliers/components/SupplierProductDeleteDialog'
import { SupplierProductTable } from '@/features/suppliers/components/SupplierProductTable'
import { SupplierProfileCard } from '@/features/suppliers/components/SupplierProfileCard'
import { SupplierStatsCards } from '@/features/suppliers/components/SupplierStatsCards'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useSupplier, useSupplierProducts } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierProductListItem } from '@/features/suppliers/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function SupplierDetailsPage() {
  const { id = '' } = useParams()
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [productFilters, setProductFilters] = useState({ supplierId: id, page: 1, limit: 10 })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<SupplierProductListItem | null>(null)

  const { data: supplier, isLoading, isError } = useSupplier(id)
  const { data: products, isLoading: productsLoading } = useSupplierProducts({
    ...productFilters,
    supplierId: id,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (isError || !supplier) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Supplier not found.</p>
        <Button asChild variant="outline">
          <Link to={SUPPLIER_ROUTES.LIST}>Back to suppliers</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={supplier.name}
        description={`${supplier.storeName || supplier.suppliedToPerson || 'No store'} · ${supplier.city || 'No city'}`}
        backTo={SUPPLIER_ROUTES.LIST}
        backLabel="Back to suppliers"
        action={
          canManage ? (
            <Button asChild>
              <Link to={SUPPLIER_ROUTES.EDIT(id)}>
                <Pencil className="h-4 w-4" />
                Edit Supplier
              </Link>
            </Button>
          ) : null
        }
      />

      <SupplierStatsCards stats={supplier.stats} />
      <SupplierProfileCard supplier={supplier} canManage={canManage} />
      <SupplierAnalyticsCards analytics={supplier.analytics} />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Products Supplied</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Products this supplier has delivered to NakNaa Electronics.
            </p>
          </div>
          {canManage ? (
            <Button asChild>
              <Link to={SUPPLIER_ROUTES.PRODUCT_CREATE(id)}>
                <Plus className="h-4 w-4" />
                Add items
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <SupplierProductTable
            supplierId={id}
            data={products}
            isLoading={productsLoading}
            canManage={canManage}
            onDelete={(product) => {
              setSelectedProduct(product)
              setDeleteOpen(true)
            }}
          />

          {products && products.meta.totalPages > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {products.meta.page} of {products.meta.totalPages} · {products.meta.total}{' '}
                records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={products.meta.page <= 1}
                  onClick={() =>
                    setProductFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={products.meta.page >= products.meta.totalPages}
                  onClick={() =>
                    setProductFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <SupplierProductDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={selectedProduct}
      />
    </div>
  )
}
