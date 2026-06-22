import { Badge } from '@/components/ui/badge'
import type { InventoryStatus } from '@/features/inventory/types'

const labels: Record<InventoryStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out Of Stock',
}

const variants: Record<InventoryStatus, 'success' | 'warning' | 'destructive'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'destructive',
}

export function StockStatusBadge({ status }: { status: InventoryStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}
