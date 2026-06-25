import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierProductForm } from '@/features/suppliers/components/SupplierProductForm'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useCreateSupplierProduct, useSupplier } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierProductFormOutput } from '@/features/suppliers/schemas/supplier.schema'

export function CreateSupplierProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: supplier, isLoading, isError } = useSupplier(id)
  const createProduct = useCreateSupplierProduct()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: SupplierProductFormOutput) => {
    setErrorMessage(null)

    try {
      const record = await createProduct.mutateAsync({
        supplierId: values.supplierId,
        productId: values.productId,
        productVariantId: values.productVariantId,
        quantitySupplied: values.quantitySupplied,
        costPrice: values.costPrice,
        dateSupplied: new Date(values.dateSupplied).toISOString(),
        notes: values.notes,
      })

      navigate(SUPPLIER_ROUTES.PRODUCT_DETAIL(id, record.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save supplier product.')
    }
  }

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
        title="Add items"
        description={`Record items supplied by ${supplier.name}.`}
        backTo={SUPPLIER_ROUTES.DETAIL(id)}
        backLabel="Back to supplier details"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SupplierProductForm
        fixedSupplierId={supplier.id}
        fixedSupplierName={supplier.name}
        isSubmitting={createProduct.isPending}
        submitLabel="Add items"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
