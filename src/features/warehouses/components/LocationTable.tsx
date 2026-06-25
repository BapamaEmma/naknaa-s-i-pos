import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { LocationListResult, WarehouseLocation } from '@/features/warehouses/types'

interface LocationTableProps {
  data?: LocationListResult
  isLoading?: boolean
  canManage?: boolean
  onEdit: (location: WarehouseLocation) => void
  onDelete: (location: WarehouseLocation) => void
}

export function LocationTable({
  data,
  isLoading,
  canManage = false,
  onEdit,
  onDelete,
}: LocationTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner layout="inline" />
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No locations found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Rack</TableHead>
            <TableHead>Bin</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((location) => (
            <TableRow key={location.id}>
              <TableCell>{location.warehouseName}</TableCell>
              <TableCell>{location.section}</TableCell>
              <TableCell>{location.rack}</TableCell>
              <TableCell>{location.bin}</TableCell>
              <TableCell className="hidden md:table-cell">{location.description || '—'}</TableCell>
              {canManage ? (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(location)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(location)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
