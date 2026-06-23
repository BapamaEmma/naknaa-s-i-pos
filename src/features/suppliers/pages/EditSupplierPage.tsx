import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierForm } from '@/features/suppliers/components/SupplierForm'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useSupplier, useUpdateSupplier } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierFormOutput } from '@/features/suppliers/schemas/supplier.schema'

export function EditSupplierPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: supplier, isLoading, isError } = useSupplier(id)
  const updateSupplier = useUpdateSupplier()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: SupplierFormOutput) => {
    if (!id) return

    setErrorMessage(null)

    try {
      await updateSupplier.mutateAsync({ id, input: values })
      navigate(SUPPLIER_ROUTES.DETAIL(id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update supplier.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
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
        title={`Edit ${supplier.name}`}
        description={supplier.city || 'Update supplier information'}
        backTo={SUPPLIER_ROUTES.DETAIL(id)}
        backLabel="Back to supplier details"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SupplierForm
        supplier={supplier}
        isSubmitting={updateSupplier.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
