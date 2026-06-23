import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { WarehouseInventoryReportRow } from '@/features/warehouses/types'
import { formatCurrency } from '@/lib/format'

interface WarehouseInventoryReportProps {
  rows?: WarehouseInventoryReportRow[]
  isLoading?: boolean
}

export function WarehouseInventoryReport({ rows = [], isLoading }: WarehouseInventoryReportProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Total Products</TableHead>
            <TableHead className="text-right">Total Quantity</TableHead>
            <TableHead className="text-right">Inventory Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.warehouseId}>
              <TableCell className="font-medium">{row.warehouseName}</TableCell>
              <TableCell className="text-right">{row.totalProducts}</TableCell>
              <TableCell className="text-right">{row.totalQuantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.inventoryValue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
