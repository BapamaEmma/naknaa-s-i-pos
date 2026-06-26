import { Link, useNavigate, useParams } from 'react-router-dom'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import { PageHeader } from '@/features/customers/components/PageHeader'
import { CUSTOMER_ROUTES } from '@/features/customers/constants'
import { useCustomer, useUpdateCustomer } from '@/features/customers/hooks/use-customers'
import type { CustomerFormOutput } from '@/features/customers/schemas/customer.schema'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'

export function EditCustomerPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { data: customer, isLoading, isError } = useCustomer(id)
  const updateCustomer = useUpdateCustomer()

  const handleSubmit = async (values: CustomerFormOutput) => {
    await updateCustomer.mutateAsync({ id, input: values })
    navigate(CUSTOMER_ROUTES.DETAIL(id))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" layout="form" />
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Customer not found.</p>
        <Button asChild variant="outline">
          <Link to={CUSTOMER_ROUTES.LIST}>Back to customers</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Edit ${customer.fullName}`}
        description="Update customer contact details, status, and notes."
        backTo={CUSTOMER_ROUTES.DETAIL(id)}
        backLabel="Back to customer"
      />

      <CustomerForm
        customer={customer}
        isSubmitting={updateCustomer.isPending}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
