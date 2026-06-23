import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ASSIGNABLE_ROLES, USER_STATUS_LABELS } from '@/features/users/constants'
import type { UserListFilters } from '@/features/users/types'
import { useInventoryBranches } from '@/features/inventory/hooks/use-inventory'
import { ROLE_LABELS } from '@/constants/roles'

interface UserFiltersProps {
  filters: UserListFilters
  onChange: (filters: UserListFilters) => void
}

export function UserFilters({ filters, onChange }: UserFiltersProps) {
  const { data: branches = [] } = useInventoryBranches()

  const update = (patch: Partial<UserListFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="user-search">Search</Label>
          <Input
            id="user-search"
            placeholder="Search by name, username, or email"
            value={filters.search ?? ''}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role-filter">Role</Label>
          <Select
            id="user-role-filter"
            value={filters.roleId ?? 'all'}
            onChange={(event) =>
              update({ roleId: event.target.value as UserListFilters['roleId'] })
            }
          >
            <option value="all">All roles</option>
            {ASSIGNABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-branch-filter">Branch</Label>
          <Select
            id="user-branch-filter"
            value={filters.branchId ?? 'all'}
            onChange={(event) => update({ branchId: event.target.value })}
          >
            <option value="all">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="user-status-filter">Status</Label>
          <Select
            id="user-status-filter"
            value={filters.status ?? 'all'}
            onChange={(event) =>
              update({ status: event.target.value as UserListFilters['status'] })
            }
          >
            <option value="all">All statuses</option>
            {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
