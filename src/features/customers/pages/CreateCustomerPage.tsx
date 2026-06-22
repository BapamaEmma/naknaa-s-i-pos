import { useNavigate } from 'react-router-dom'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import { PageHeader } from '@/features/customers/components/PageHeader'
import { CUSTOMER_ROUTES } from '@/features/customers/constants'
import { useCreateCustomer } from '@/features/customers/hooks/use-customers'
import type { CustomerFormOutput } from '@/features/customers/schemas/customer.schema'

export function CreateCustomerPage() {
  const navigate = useNavigate()
  const createCustomer = useCreateCustomer()

  const handleSubmit = async (values: CustomerFormOutput) => {
    const customer = await createCustomer.mutateAsync(values)
    navigate(CUSTOMER_ROUTES.DETAIL(customer.id))
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Create Customer"
        description="Add a new customer to your NakNaa Electronics database."
        backTo={CUSTOMER_ROUTES.LIST}
        backLabel="Back to customers"
      />

      <CustomerForm
        isSubmitting={createCustomer.isPending}
        submitLabel="Create customer"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
