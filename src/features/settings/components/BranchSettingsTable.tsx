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
import type { SettingsBranch } from '@/features/settings/types'

interface BranchSettingsTableProps {
  branches: SettingsBranch[]
  isLoading?: boolean
  onEdit: (branch: SettingsBranch) => void
  onToggleStatus: (branch: SettingsBranch) => void
}

export function BranchSettingsTable({
  branches,
  isLoading,
  onEdit,
  onToggleStatus,
}: BranchSettingsTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (branches.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border p-8 text-center">
        <p className="text-lg font-medium">No branches configured</p>
        <p className="mt-1 text-sm text-muted-foreground">Create your first branch to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch Name</TableHead>
            <TableHead className="hidden sm:table-cell">Code</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.branchName}</TableCell>
              <TableCell className="hidden sm:table-cell">{branch.branchCode}</TableCell>
              <TableCell className="hidden max-w-xs truncate md:table-cell">{branch.address}</TableCell>
              <TableCell className="hidden lg:table-cell">{branch.phoneNumber}</TableCell>
              <TableCell className="hidden lg:table-cell">{branch.manager}</TableCell>
              <TableCell>
                <Badge variant={branch.status === 'active' ? 'success' : 'secondary'}>
                  {SETTINGS_STATUS_LABELS[branch.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${branch.branchName}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(branch)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onToggleStatus(branch)}>
                      {branch.status === 'active' ? (
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
