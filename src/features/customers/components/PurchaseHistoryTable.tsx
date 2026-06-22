import { Link } from 'react-router-dom'
import { Eye, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PaymentMethodBadge } from '@/features/sales/components/PaymentMethodBadge'
import { SALES_ROUTES } from '@/features/sales/constants'
import type { CustomerPurchase } from '@/features/customers/types'
import { formatCurrency, formatDateTime } from '@/lib/format'

interface PurchaseHistoryTableProps {
  purchases: CustomerPurchase[]
  isLoading?: boolean
}

export function PurchaseHistoryTable({ purchases, isLoading }: PurchaseHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border">
        <LoadingSpinner />
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border text-sm text-muted-foreground">
        No purchase history found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items Purchased</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-medium">{purchase.receiptNumber}</TableCell>
              <TableCell>{formatDateTime(purchase.saleDate)}</TableCell>
              <TableCell>
                <div>
                  <p>{purchase.itemsPurchased} item{purchase.itemsPurchased === 1 ? '' : 's'}</p>
                  <p className="text-xs text-muted-foreground">{purchase.itemSummary}</p>
                </div>
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={purchase.paymentMethod} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(purchase.totalAmount)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View sale">
                    <Link to={SALES_ROUTES.DETAIL(purchase.saleId)}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View receipt">
                    <Link to={SALES_ROUTES.RECEIPT(purchase.saleId)}>
                      <Receipt className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
