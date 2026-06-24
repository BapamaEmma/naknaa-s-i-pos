import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WAREHOUSE_STATUS_LABELS } from '@/features/warehouses/constants'
import type { WarehouseDetail } from '@/features/warehouses/types'
import { formatCurrency } from '@/lib/format'

interface WarehouseInfoCardProps {
  warehouse: WarehouseDetail
}

export function WarehouseInfoCard({ warehouse }: WarehouseInfoCardProps) {
  const fields = [
    { label: 'Warehouse Name', value: warehouse.warehouseName },
    { label: 'Warehouse Code', value: warehouse.warehouseCode },
    { label: 'Description', value: warehouse.description || '—' },
    { label: 'Address', value: warehouse.address || '—' },
    { label: 'Manager', value: warehouse.manager || '—' },
    {
      label: 'Status',
      value: (
        <Badge variant={warehouse.status === 'active' ? 'success' : 'secondary'}>
          {WAREHOUSE_STATUS_LABELS[warehouse.status]}
        </Badge>
      ),
    },
    { label: 'Total Products', value: warehouse.totalProducts },
    { label: 'Total Stock Quantity', value: warehouse.totalStockQuantity },
    { label: 'Inventory Value', value: formatCurrency(warehouse.inventoryValue) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{field.label}</p>
            <div className="font-medium">{field.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
