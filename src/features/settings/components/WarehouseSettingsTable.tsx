import { MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react'
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
import { SETTINGS_STATUS_LABELS } from '@/features/settings/constants'
import type { SettingsWarehouse } from '@/features/settings/types'

interface WarehouseSettingsTableProps {
  warehouses: SettingsWarehouse[]
  isLoading?: boolean
  onEdit: (warehouse: SettingsWarehouse) => void
  onToggleStatus: (warehouse: SettingsWarehouse) => void
}

export function WarehouseSettingsTable({
  warehouses,
  isLoading,
  onEdit,
  onToggleStatus,
}: WarehouseSettingsTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (warehouses.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border p-8 text-center">
        <p className="text-lg font-medium">No warehouses configured</p>
        <p className="mt-1 text-sm text-muted-foreground">Create a warehouse to manage inventory locations.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden lg:table-cell">Address</TableHead>
            <TableHead className="hidden sm:table-cell">Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="font-medium">{warehouse.warehouseName}</TableCell>
              <TableCell className="hidden max-w-xs truncate md:table-cell">
                {warehouse.description || '—'}
              </TableCell>
              <TableCell className="hidden max-w-xs truncate lg:table-cell">{warehouse.address}</TableCell>
              <TableCell className="hidden sm:table-cell">{warehouse.manager}</TableCell>
              <TableCell>
                <Badge variant={warehouse.status === 'active' ? 'success' : 'secondary'}>
                  {SETTINGS_STATUS_LABELS[warehouse.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Actions for ${warehouse.warehouseName}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(warehouse)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onToggleStatus(warehouse)}>
                      {warehouse.status === 'active' ? (
                        <>
                          <PowerOff className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4" />
                          Activate
                        </>
                      )}
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
