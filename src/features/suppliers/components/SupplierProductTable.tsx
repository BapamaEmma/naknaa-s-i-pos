import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { SUPPLIER_ROUTES } from '@/features/suppliers/constants'
import type { SupplierProductListItem, SupplierProductListResult } from '@/features/suppliers/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface SupplierProductTableProps {
  supplierId: string
  data?: SupplierProductListResult
  isLoading?: boolean
  canManage?: boolean
  onDelete: (product: SupplierProductListItem) => void
}

export function SupplierProductTable({
  supplierId,
  data,
  isLoading,
  canManage = false,
  onDelete,
}: SupplierProductTableProps) {
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
        <p className="text-lg font-medium">No products supplied yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use Add items to record the first supply from this supplier.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead className="hidden sm:table-cell">Quantity Supplied</TableHead>
            <TableHead className="text-right">Cost Price</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
            <TableHead className="hidden md:table-cell">Date Supplied</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.productName}</TableCell>
              <TableCell>{entry.variantName}</TableCell>
              <TableCell className="hidden sm:table-cell">{entry.quantitySupplied}</TableCell>
              <TableCell className="text-right">{formatCurrency(entry.costPrice)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(entry.totalCost)}</TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(entry.dateSupplied)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${entry.productName}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={SUPPLIER_ROUTES.PRODUCT_DETAIL(supplierId, entry.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    {canManage ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={SUPPLIER_ROUTES.PRODUCT_EDIT(supplierId, entry.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onDelete(entry)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : null}
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
