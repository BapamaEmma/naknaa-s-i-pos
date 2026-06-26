import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierProductDetailsCard } from '@/features/suppliers/components/SupplierProductDetailsCard'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useSupplierProduct } from '@/features/suppliers/hooks/use-suppliers'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function SupplierProductDetailsPage() {
  const { id = '', supplyId = '' } = useParams()
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const { data: product, isLoading, isError } = useSupplierProduct(supplyId)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Supplier product record not found.</p>
        <Button asChild variant="outline">
          <Link to={SUPPLIER_ROUTES.DETAIL(id)}>Back to supplier details</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={`${product.productName} · ${product.variantName}`}
        description={`Supplied by ${product.supplierName}`}
        backTo={SUPPLIER_ROUTES.DETAIL(id)}
        backLabel="Back to supplier details"
        action={
          canManage ? (
            <Button asChild>
              <Link to={SUPPLIER_ROUTES.PRODUCT_EDIT(id, supplyId)}>
                <Pencil className="h-4 w-4" />
                Edit Record
              </Link>
            </Button>
          ) : null
        }
      />

      <SupplierProductDetailsCard product={product} />
    </div>
  )
}
