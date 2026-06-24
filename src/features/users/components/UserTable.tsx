import { Link } from 'react-router-dom'
import {
  Ban,
  Eye,
  KeyRound,
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
import { USER_ROUTES, USER_STATUS_LABELS } from '@/features/users/constants'
import type { UserListItem, UserListResult } from '@/features/users/types'
import { formatDateTime } from '@/lib/format'

interface UserTableProps {
  data?: UserListResult
  isLoading?: boolean
  canManage?: boolean
  onResetPassword: (user: UserListItem) => void
  onSuspend: (user: UserListItem) => void
  onDelete: (user: UserListItem) => void
}

function statusVariant(status: UserListItem['status']) {
  if (status === 'active') return 'success'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

export function UserTable({
  data,
  isLoading,
  canManage = false,
  onResetPassword,
  onSuspend,
  onDelete,
}: UserTableProps) {
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
        <p className="text-lg font-medium">No users found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust your filters or add a new user.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead className="hidden md:table-cell">Username</TableHead>
            <TableHead className="hidden lg:table-cell">Email</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="hidden xl:table-cell">Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Last Login</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.employeeId}</TableCell>
              <TableCell>
                <Link
                  to={USER_ROUTES.DETAIL(user.id)}
                  className="font-medium hover:underline"
                >
                  {user.fullName}
                </Link>
                <p className="text-xs text-muted-foreground md:hidden">{user.username || '—'}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{user.username || '—'}</TableCell>
              <TableCell className="hidden lg:table-cell">{user.email || '—'}</TableCell>
              <TableCell className="hidden sm:table-cell">{user.roleName}</TableCell>
              <TableCell className="hidden xl:table-cell">{user.branchName}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(user.status)}>
                  {USER_STATUS_LABELS[user.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={`Actions for ${user.fullName}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={USER_ROUTES.DETAIL(user.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    {canManage ? (
                      <DropdownMenuItem asChild>
                        <Link to={USER_ROUTES.EDIT(user.id)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    {canManage ? (
                      <DropdownMenuItem onSelect={() => onResetPassword(user)}>
                        <KeyRound className="h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                    ) : null}
                    {canManage && user.status !== 'suspended' && user.roleId !== 'administrator' ? (
                      <DropdownMenuItem onSelect={() => onSuspend(user)}>
                        <Ban className="h-4 w-4" />
                        Suspend User
                      </DropdownMenuItem>
                    ) : null}
                    {canManage ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete User
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
