import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierProductForm } from '@/features/suppliers/components/SupplierProductForm'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useSupplierProduct, useUpdateSupplierProduct } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierProductFormOutput } from '@/features/suppliers/schemas/supplier.schema'

export function EditSupplierProductPage() {
  const { id = '', supplyId = '' } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useSupplierProduct(supplyId)
  const updateProduct = useUpdateSupplierProduct()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: SupplierProductFormOutput) => {
    setErrorMessage(null)

    try {
      await updateProduct.mutateAsync({
        id: supplyId,
        input: {
          productId: values.productId,
          productVariantId: values.productVariantId,
          quantitySupplied: values.quantitySupplied,
          costPrice: values.costPrice,
          dateSupplied: new Date(values.dateSupplied).toISOString(),
          notes: values.notes,
        },
      })

      navigate(SUPPLIER_ROUTES.PRODUCT_DETAIL(id, supplyId))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update supplier product.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" layout="form" />
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
        title={`Edit ${product.productName}`}
        description={`${product.variantName} · ${product.supplierName}`}
        backTo={SUPPLIER_ROUTES.PRODUCT_DETAIL(id, supplyId)}
        backLabel="Back to supply record"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SupplierProductForm
        supplierProduct={product}
        fixedSupplierId={product.supplierId}
        fixedSupplierName={product.supplierName}
        isSubmitting={updateProduct.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
