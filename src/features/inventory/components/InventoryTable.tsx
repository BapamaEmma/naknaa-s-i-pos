import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, MoreHorizontal, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/format'
import { INVENTORY_ROUTES } from '@/features/inventory/constants'
import { StockStatusBadge } from '@/features/inventory/components/StockStatusBadge'
import type { InventoryListResult } from '@/features/inventory/types'

interface InventoryTableProps {
  data?: InventoryListResult
  isLoading: boolean
}

export function InventoryTable({ data, isLoading }: InventoryTableProps) {
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
        <p className="text-lg font-medium">No inventory records found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Branch</TableHead>
            <TableHead>Current Qty</TableHead>
            <TableHead className="hidden sm:table-cell">Minimum</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.variantName}</TableCell>
              <TableCell className="hidden md:table-cell">{item.categoryName}</TableCell>
              <TableCell className="hidden lg:table-cell">{item.branchName}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell className="hidden sm:table-cell">{item.minimumStockLevel}</TableCell>
              <TableCell>
                <StockStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="hidden xl:table-cell">{formatDate(item.lastUpdated)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${item.productName}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        to={`${INVENTORY_ROUTES.STOCK_IN}?productId=${item.productId}&variantId=${item.productVariantId}&branchId=${item.branchId}`}
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        Stock In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={`${INVENTORY_ROUTES.STOCK_OUT}?productId=${item.productId}&variantId=${item.productVariantId}&branchId=${item.branchId}`}
                      >
                        <ArrowUpFromLine className="h-4 w-4" />
                        Stock Out
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={`${INVENTORY_ROUTES.ADJUSTMENT}?productId=${item.productId}&variantId=${item.productVariantId}&branchId=${item.branchId}`}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Adjust Stock
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
