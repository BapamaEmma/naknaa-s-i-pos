import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { formatCurrency } from '@/lib/format'
import type { ProductVariant } from '@/features/products/types'

interface VariantTableProps {
  variants: ProductVariant[]
  isLoading?: boolean
  onEdit: (variant: ProductVariant) => void
  onDelete: (variant: ProductVariant) => void
}

function StockBadge({ variant }: { variant: ProductVariant }) {
  if (variant.currentStock === 0) {
    return <Badge variant="destructive">Out of stock</Badge>
  }

  if (variant.currentStock <= variant.minimumStock) {
    return <Badge variant="warning">Low stock</Badge>
  }

  return <Badge variant="success">In stock</Badge>
}

export function VariantTable({
  variants,
  isLoading = false,
  onEdit,
  onDelete,
}: VariantTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (variants.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <p className="font-medium">No variants yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add variants to track pricing and stock for this product.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant Name</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead>Cost Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead className="hidden sm:table-cell">Current Stock</TableHead>
            <TableHead className="hidden lg:table-cell">Minimum Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell className="font-medium">{variant.name}</TableCell>
              <TableCell className="hidden md:table-cell">{variant.variantType}</TableCell>
              <TableCell>{formatCurrency(variant.costPrice)}</TableCell>
              <TableCell>{formatCurrency(variant.sellingPrice)}</TableCell>
              <TableCell className="hidden sm:table-cell">{variant.currentStock}</TableCell>
              <TableCell className="hidden lg:table-cell">{variant.minimumStock}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant={variant.isActive ? 'success' : 'secondary'}>
                    {variant.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="sm:hidden">
                    <StockBadge variant={variant} />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${variant.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(variant)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(variant)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
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
