import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/features/users/components/PageHeader'
import { UserActivityTable } from '@/features/users/components/UserActivityTable'
import { USER_ROUTES } from '@/features/users/constants'
import { useUser, useUserActivity } from '@/features/users/hooks/use-users'
import type { UserActivityFilters } from '@/features/users/types'

export function UserActivityPage() {
  const { id = '' } = useParams()
  const [filters, setFilters] = useState<UserActivityFilters>({
    page: 1,
    limit: 10,
  })

  const { data: user, isLoading: userLoading, isError } = useUser(id)
  const { data, isLoading } = useUserActivity(id, filters)

  if (userLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <LoadingSpinner size="lg" layout="table" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">User not found.</p>
        <Button asChild variant="outline">
          <Link to={USER_ROUTES.LIST}>Back to users</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="User Activity"
        description={`Activity log for ${user.fullName}`}
        backTo={USER_ROUTES.DETAIL(id)}
        backLabel="Back to user details"
      />

      <UserActivityTable data={data} isLoading={isLoading} />

      {data && data.meta.totalPages > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} activities
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
