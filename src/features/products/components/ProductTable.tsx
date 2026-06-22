import { Link } from 'react-router-dom'
import {
  Eye,
  Layers3,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { PRODUCT_ROUTES } from '@/features/products/constants'
import type { ProductListItem, ProductListResult } from '@/features/products/types'

interface ProductTableProps {
  data?: ProductListResult
  isLoading: boolean
  onDelete: (product: ProductListItem) => void
}

function ProductImage({ imageUrl, name }: { imageUrl: string; name: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-12 w-12 rounded-md border object-cover"
      />
    )
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-xs font-medium text-muted-foreground">
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function ProductTable({ data, isLoading, onDelete }: ProductTableProps) {
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
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or add a new product to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Brand</TableHead>
            <TableHead className="hidden lg:table-cell">Model</TableHead>
            <TableHead className="hidden sm:table-cell">Variants</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <ProductImage imageUrl={product.imageUrl} name={product.name} />
              </TableCell>
              <TableCell>
                <div>
                  <Link
                    to={PRODUCT_ROUTES.DETAIL(product.id)}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground md:hidden">{product.categoryName}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{product.categoryName}</TableCell>
              <TableCell className="hidden lg:table-cell">{product.brand}</TableCell>
              <TableCell className="hidden lg:table-cell">{product.model || '—'}</TableCell>
              <TableCell className="hidden sm:table-cell">{product.variantCount}</TableCell>
              <TableCell>
                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${product.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={PRODUCT_ROUTES.DETAIL(product.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={PRODUCT_ROUTES.EDIT(product.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={PRODUCT_ROUTES.VARIANTS(product.id)}>
                        <Layers3 className="h-4 w-4" />
                        Manage Variants
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(product)}
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
