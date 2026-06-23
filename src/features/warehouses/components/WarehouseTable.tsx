import { Link } from 'react-router-dom'
import { Eye, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { WAREHOUSE_ROUTES, WAREHOUSE_STATUS_LABELS } from '@/features/warehouses/constants'
import type { WarehouseListItem, WarehouseListResult } from '@/features/warehouses/types'

interface WarehouseTableProps {
  data?: WarehouseListResult
  isLoading?: boolean
  canManage?: boolean
  onDelete: (warehouse: WarehouseListItem) => void
}

export function WarehouseTable({ data, isLoading, canManage = false, onDelete }: WarehouseTableProps) {
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
        <p className="text-lg font-medium">No warehouses found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Warehouse Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Products</TableHead>
            <TableHead className="text-right">Stock Qty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="font-medium">{warehouse.warehouseCode}</TableCell>
              <TableCell>
                <Link to={WAREHOUSE_ROUTES.DETAIL(warehouse.id)} className="font-medium hover:underline">
                  {warehouse.warehouseName}
                </Link>
              </TableCell>
              <TableCell className="hidden max-w-xs truncate md:table-cell">
                {warehouse.description || '—'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{warehouse.totalProducts}</TableCell>
              <TableCell className="text-right">{warehouse.totalStockQuantity}</TableCell>
              <TableCell>
                <Badge variant={warehouse.status === 'active' ? 'success' : 'secondary'}>
                  {WAREHOUSE_STATUS_LABELS[warehouse.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${warehouse.warehouseName}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={WAREHOUSE_ROUTES.DETAIL(warehouse.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`${WAREHOUSE_ROUTES.LOCATIONS}?warehouse=${warehouse.id}`}>
                        <MapPin className="h-4 w-4" />
                        View Inventory
                      </Link>
                    </DropdownMenuItem>
                    {canManage ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={WAREHOUSE_ROUTES.EDIT(warehouse.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onDelete(warehouse)}
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
