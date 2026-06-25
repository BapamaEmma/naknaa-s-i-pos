import { Link } from 'react-router-dom'
import { ArrowDownToLine, SlidersHorizontal } from 'lucide-react'
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
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import { StockStatusBadge } from '@/features/inventory/components/StockStatusBadge'
import type { InventoryListResult } from '@/features/inventory/types'

interface LowStockTableProps {
  data?: InventoryListResult
  isLoading: boolean
}

export function LowStockTable({ data, isLoading }: LowStockTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-medium">No low stock items</p>
        <p className="mt-1 text-sm text-muted-foreground">All inventory levels are healthy.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead className="hidden md:table-cell">Current Qty</TableHead>
            <TableHead className="hidden md:table-cell">Minimum Stock</TableHead>
            <TableHead className="hidden lg:table-cell">Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((item) => (
            <TableRow key={item.id} className={item.status === 'out_of_stock' ? 'bg-destructive/5' : ''}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.variantName}</TableCell>
              <TableCell className="hidden md:table-cell">{item.quantity}</TableCell>
              <TableCell className="hidden md:table-cell">{item.minimumStockLevel}</TableCell>
              <TableCell className="hidden lg:table-cell">{item.branchName}</TableCell>
              <TableCell>
                <StockStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`${INVENTORY_ROUTES.STOCK_IN}?productId=${item.productId}&variantId=${item.productVariantId}&branchId=${item.branchId}`}
                    >
                      <ArrowDownToLine className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`${INVENTORY_ROUTES.ADJUSTMENT}?productId=${item.productId}&variantId=${item.productVariantId}&branchId=${item.branchId}`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
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
