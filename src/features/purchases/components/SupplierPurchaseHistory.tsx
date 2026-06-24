import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { SupplierPurchaseHistoryItem } from '@/features/purchases/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SupplierPurchaseHistoryProps {
  items: SupplierPurchaseHistoryItem[]
  isLoading?: boolean
}

export function SupplierPurchaseHistory({ items, isLoading }: SupplierPurchaseHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border">
        <LoadingSpinner />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border text-sm text-muted-foreground">
        No supplier purchase history yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Total Purchases</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="hidden sm:table-cell">Last Purchase</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.supplierId}>
              <TableCell className="font-medium">{item.supplierName}</TableCell>
              <TableCell className="text-right">{item.totalPurchases}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {item.lastPurchaseDate ? formatDate(item.lastPurchaseDate) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
