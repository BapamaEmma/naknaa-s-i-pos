import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PurchaseItem } from '@/features/purchases/types'
import { formatCurrency } from '@/lib/format'

interface PurchaseItemsTableProps {
  items: PurchaseItem[]
  showReceiving?: boolean
}

export function PurchaseItemsTable({ items, showReceiving = false }: PurchaseItemsTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No products on this purchase.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            {showReceiving ? (
              <>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </>
            ) : null}
            <TableHead className="text-right">Cost Price</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.variantName}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              {showReceiving ? (
                <>
                  <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                  <TableCell className="text-right">
                    {Math.max(item.quantity - item.receivedQuantity, 0)}
                  </TableCell>
                </>
              ) : null}
              <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.totalCost)}</TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {item.section} / {item.rack} / {item.bin}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
