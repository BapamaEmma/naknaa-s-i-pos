import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomerDashboardCards } from '@/features/customers/components/CustomerDashboardCards'
import { CustomerDeleteDialog } from '@/features/customers/components/CustomerDeleteDialog'
import { CustomerFilters } from '@/features/customers/components/CustomerFilters'
import { CustomerTable } from '@/features/customers/components/CustomerTable'
import { PageHeader } from '@/features/customers/components/PageHeader'
import { CUSTOMER_ROUTES } from '@/features/customers/constants'
import { useCustomerSummary, useCustomers } from '@/features/customers/hooks/use-customers'
import type { CustomerListFilters, CustomerListItem } from '@/features/customers/types'

export function CustomerListPage() {
  const [filters, setFilters] = useState<CustomerListFilters>({
    page: 1,
    limit: 10,
    status: 'all',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null)

  const { data: summary, isLoading: summaryLoading } = useCustomerSummary()
  const { data, isLoading } = useCustomers(filters)

  const openDeleteDialog = (customer: CustomerListItem) => {
    setSelectedCustomer(customer)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Customers"
        description="Manage customer profiles, purchase history, and contact information."
        action={
          <Button asChild>
            <Link to={CUSTOMER_ROUTES.CREATE}>
              <Plus className="h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        }
      />

      <CustomerDashboardCards summary={summary} isLoading={summaryLoading} />
      <CustomerFilters filters={filters} onChange={setFilters} />
      <CustomerTable data={data} isLoading={isLoading} onDelete={openDeleteDialog} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} customers
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

      <CustomerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customer={selectedCustomer}
      />
    </div>
  )
}
