import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import type { SupplierDetail } from '@/features/suppliers/types'

interface SupplierProfileCardProps {
  supplier: SupplierDetail
  canManage?: boolean
}

export function SupplierProfileCard({ supplier, canManage = false }: SupplierProfileCardProps) {
  const fields = [
    { label: 'Supplier Name', value: supplier.name },
    { label: 'Supplier Store Name', value: supplier.storeName || '—' },
    { label: 'Person We Supply To', value: supplier.suppliedToPerson || '—' },
    { label: 'Email', value: supplier.email || '—' },
    { label: 'Phone Number', value: supplier.phoneNumber || '—' },
    { label: 'Address', value: supplier.address || '—' },
    { label: 'City', value: supplier.city || '—' },
    {
      label: 'Status',
      value: (
        <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
          {supplier.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <p className="text-sm text-muted-foreground">{field.label}</p>
              <div className="font-medium">{field.value}</div>
            </div>
          ))}
        </div>

        {canManage ? (
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm text-muted-foreground">
              Record products this supplier delivers to NakNaa Electronics.
            </p>
            <Button asChild className="mt-3">
              <Link to={SUPPLIER_ROUTES.PRODUCT_CREATE(supplier.id)}>
                <Plus className="h-4 w-4" />
                Add items
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
