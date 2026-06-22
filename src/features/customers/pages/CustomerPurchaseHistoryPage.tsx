import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/customers/components/PageHeader'
import { PurchaseHistoryFilters } from '@/features/customers/components/PurchaseHistoryFilters'
import { PurchaseHistoryTable } from '@/features/customers/components/PurchaseHistoryTable'
import { TopPurchasedProducts } from '@/features/customers/components/TopPurchasedProducts'
import { CUSTOMER_ROUTES } from '@/features/customers/constants'
import { useCustomer, useCustomerPurchases } from '@/features/customers/hooks/use-customers'
import type { CustomerPurchaseFilters } from '@/features/customers/types'
import { formatCurrency } from '@/lib/format'

export function CustomerPurchaseHistoryPage() {
  const { id = '' } = useParams()
  const [filters, setFilters] = useState<CustomerPurchaseFilters>({
    page: 1,
    limit: 10,
    paymentMethod: 'all',
  })

  const { data: customer, isLoading: customerLoading } = useCustomer(id)
  const { data, isLoading } = useCustomerPurchases(id, filters)

  if (customerLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!customer) {
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
        title={`Purchase History · ${customer.fullName}`}
        description={`${customer.customerCode} · All sales linked to this customer.`}
        backTo={CUSTOMER_ROUTES.DETAIL(id)}
        backLabel="Back to customer"
        action={
          <Button variant="outline" asChild>
            <Link to={CUSTOMER_ROUTES.EDIT(id)}>
              <Pencil className="h-4 w-4" />
              Edit Customer
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.summary.totalPurchases ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.summary.totalRevenue ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.summary.averageOrderValue ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <PurchaseHistoryFilters filters={filters} onChange={setFilters} />
      <PurchaseHistoryTable purchases={data?.purchases ?? []} isLoading={isLoading} />
      <TopPurchasedProducts products={data?.topProducts ?? []} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} purchases
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
    </div>
  )
}
