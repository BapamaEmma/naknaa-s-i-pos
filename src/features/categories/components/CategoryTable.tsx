import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { formatDate } from '@/lib/format'
import { CATEGORY_ROUTES } from '@/features/categories/constants'
import type { CategoryListItem, CategoryListResult } from '@/features/categories/types'

interface CategoryTableProps {
  data?: CategoryListResult
  isLoading: boolean
  onDelete: (category: CategoryListItem) => void
}

export function CategoryTable({ data, isLoading, onDelete }: CategoryTableProps) {
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
        <p className="text-lg font-medium">No categories found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or create a new category.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Total Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <Link
                  to={CATEGORY_ROUTES.DETAIL(category.id)}
                  className="font-medium hover:underline"
                >
                  {category.name}
                </Link>
              </TableCell>
              <TableCell className="hidden max-w-xs truncate md:table-cell">
                {category.description || '—'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{category.totalProducts}</TableCell>
              <TableCell>
                <Badge variant={category.isActive ? 'success' : 'secondary'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(category.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${category.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={CATEGORY_ROUTES.DETAIL(category.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={CATEGORY_ROUTES.EDIT(category.id)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(category)}
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
