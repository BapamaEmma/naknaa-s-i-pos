import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierCreateForm } from '@/features/suppliers/components/SupplierCreateForm'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useCreateSupplier } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierCreateFormOutput } from '@/features/suppliers/schemas/supplier.schema'

export function CreateSupplierPage() {
  const navigate = useNavigate()
  const createSupplier = useCreateSupplier()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (values: SupplierCreateFormOutput) => {
    setErrorMessage(null)

    try {
      const supplier = await createSupplier.mutateAsync({
        name: values.name,
        storeName: values.storeName,
        suppliedToPerson: values.suppliedToPerson,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        city: values.city,
        notes: values.notes,
        isActive: values.isActive,
        items: values.items,
      })

      navigate(SUPPLIER_ROUTES.DETAIL(supplier.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create supplier.')
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create Supplier"
        description="Add a supplier and record all items they supply in one form."
        backTo={SUPPLIER_ROUTES.LIST}
        backLabel="Back to suppliers"
      />

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <SupplierCreateForm
        isSubmitting={createSupplier.isPending}
        submitLabel="Save supplier & items"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
