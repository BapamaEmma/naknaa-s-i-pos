import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/sales/components/PageHeader'
import { SalesFilters } from '@/features/sales/components/SalesFilters'
import { SalesStatsCards } from '@/features/sales/components/SalesStatsCards'
import { SalesTable } from '@/features/sales/components/SalesTable'
import { SALES_ROUTES } from '@/features/sales/constants'
import {
  useSales,
  useSalesCashiers,
  useSalesCustomers,
  useSalesSummary,
} from '@/features/sales/hooks/use-sales'
import type { SalesListFilters } from '@/features/sales/types'

export function SalesHistoryPage() {
  const [filters, setFilters] = useState<SalesListFilters>({
    page: 1,
    limit: 10,
    paymentMethod: 'all',
  })

  const { data: summary, isLoading: summaryLoading } = useSalesSummary()
  const { data: customers = [] } = useSalesCustomers()
  const { data: cashiers = [] } = useSalesCashiers()
  const { data, isLoading } = useSales(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Sales History"
        description="Review completed sales, receipts, and payment records."
        action={
          <Button asChild>
            <Link to={SALES_ROUTES.NEW}>
              <Plus className="h-4 w-4" />
              New Sale
            </Link>
          </Button>
        }
      />

      <SalesStatsCards summary={summary} isLoading={summaryLoading} />

      <SalesFilters
        filters={filters}
        customers={customers}
        cashiers={cashiers}
        onChange={setFilters}
      />

      <SalesTable data={data} isLoading={isLoading} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} sales
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
