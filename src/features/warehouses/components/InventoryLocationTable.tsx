import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { InventoryLocationListResult } from '@/features/warehouses/types'

interface InventoryLocationTableProps {
  data?: InventoryLocationListResult
  isLoading?: boolean
}

export function InventoryLocationTable({ data, isLoading }: InventoryLocationTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No inventory location records found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.productName}</TableCell>
              <TableCell>{entry.brand}</TableCell>
              <TableCell>{entry.color}</TableCell>
              <TableCell>{entry.warehouseName}</TableCell>
              <TableCell className="text-right font-medium">{entry.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
