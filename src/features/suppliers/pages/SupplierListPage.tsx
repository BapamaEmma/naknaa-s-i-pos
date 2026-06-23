import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/suppliers/components/PageHeader'
import { SupplierDeleteDialog } from '@/features/suppliers/components/SupplierDeleteDialog'
import { SupplierFilters } from '@/features/suppliers/components/SupplierFilters'
import { SupplierTable } from '@/features/suppliers/components/SupplierTable'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierListFilters, SupplierListItem } from '@/features/suppliers/types'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/roles'

export function SupplierListPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole(USER_ROLES.ADMIN)
  const [filters, setFilters] = useState<SupplierListFilters>({
    page: 1,
    limit: 10,
    status: 'all',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierListItem | null>(null)

  const { data, isLoading } = useSuppliers(filters)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Suppliers"
        description="Manage supplier profiles and track products supplied to NakNaa Electronics."
        action={
          canManage ? (
            <Button asChild>
              <Link to={SUPPLIER_ROUTES.CREATE}>
                <Plus className="h-4 w-4" />
                Add Supplier
              </Link>
            </Button>
          ) : null
        }
      />

      <SupplierFilters filters={filters} onChange={setFilters} />
      <SupplierTable
        data={data}
        isLoading={isLoading}
        onDelete={(supplier) => {
          setSelectedSupplier(supplier)
          setDeleteOpen(true)
        }}
      />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} suppliers
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

      <SupplierDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        supplier={selectedSupplier}
      />
    </div>
  )
}
