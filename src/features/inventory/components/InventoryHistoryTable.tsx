import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDateTime } from '@/lib/format'
import { TRANSACTION_TYPE_LABELS } from '@/features/inventory/constants'
import type { InventoryHistoryResult } from '@/features/inventory/types'

interface InventoryHistoryTableProps {
  data?: InventoryHistoryResult
  isLoading: boolean
}

export function InventoryHistoryTable({ data, isLoading }: InventoryHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-medium">No transactions found</p>
        <p className="mt-1 text-sm text-muted-foreground">Adjust filters to broaden your search.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="hidden md:table-cell">Variant</TableHead>
            <TableHead className="hidden lg:table-cell">Branch</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="hidden sm:table-cell">User</TableHead>
            <TableHead className="hidden xl:table-cell">Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
              <TableCell className="font-medium">{transaction.productName}</TableCell>
              <TableCell className="hidden md:table-cell">{transaction.variantName}</TableCell>
              <TableCell className="hidden lg:table-cell">{transaction.branchName}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {TRANSACTION_TYPE_LABELS[transaction.transactionType]}
                </Badge>
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell className="hidden sm:table-cell">{transaction.userName}</TableCell>
              <TableCell className="hidden font-mono text-xs xl:table-cell">
                {transaction.referenceNumber}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
