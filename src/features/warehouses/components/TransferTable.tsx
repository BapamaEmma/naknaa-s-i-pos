import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { TransferListResult } from '@/features/warehouses/types'
import { formatDateTime } from '@/lib/format'

interface TransferTableProps {
  data?: TransferListResult
  isLoading?: boolean
}

export function TransferTable({ data, isLoading }: TransferTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No transfer history yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transfer #</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="hidden lg:table-cell">User</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((transfer) => (
            <TableRow key={transfer.id}>
              <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
              <TableCell>{transfer.productName}</TableCell>
              <TableCell>{transfer.variantName}</TableCell>
              <TableCell>{transfer.fromWarehouseName}</TableCell>
              <TableCell>{transfer.toWarehouseName}</TableCell>
              <TableCell className="text-right">{transfer.quantity}</TableCell>
              <TableCell className="hidden lg:table-cell">{transfer.userName}</TableCell>
              <TableCell className="hidden md:table-cell">{formatDateTime(transfer.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
