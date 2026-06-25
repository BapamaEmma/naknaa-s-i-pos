import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { History, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CustomerNotesCard } from '@/features/customers/components/CustomerNotesCard'
import { CustomerProfileCard } from '@/features/customers/components/CustomerProfileCard'
import { CustomerStatsCards } from '@/features/customers/components/CustomerStatsCards'
import { PageHeader } from '@/features/customers/components/PageHeader'
import { PurchaseHistoryTable } from '@/features/customers/components/PurchaseHistoryTable'
import { TopPurchasedProducts } from '@/features/customers/components/TopPurchasedProducts'
import { CUSTOMER_ROUTES } from '@/features/customers/constants'
import { useCustomer } from '@/features/customers/hooks/use-customers'

export function CustomerDetailsPage() {
  const { id = '' } = useParams()
  const { data: customer, isLoading, isError } = useCustomer(id)
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
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
        title={customer.fullName}
        description={`${customer.customerCode} · ${customer.phoneNumber}`}
        backTo={CUSTOMER_ROUTES.LIST}
        backLabel="Back to customers"
        action={
          <>
            <Button variant="outline" asChild>
              <Link to={CUSTOMER_ROUTES.PURCHASES(id)}>
                <History className="h-4 w-4" />
                Purchase History
              </Link>
            </Button>
            <Button asChild>
              <Link to={CUSTOMER_ROUTES.EDIT(id)}>
                <Pencil className="h-4 w-4" />
                Edit Customer
              </Link>
            </Button>
          </>
        }
      />

      <CustomerStatsCards stats={customer.stats} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'purchases', label: 'Recent Purchases' },
          { value: 'notes', label: 'Notes' },
        ]}
      />

      {activeTab === 'overview' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CustomerProfileCard customer={customer} />
          <TopPurchasedProducts products={customer.topProducts} />
        </div>
      ) : null}

      {activeTab === 'purchases' ? (
        <PurchaseHistoryTable purchases={customer.recentPurchases} />
      ) : null}

      {activeTab === 'notes' ? <CustomerNotesCard customer={customer} /> : null}
    </div>
  )
}
