import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/shared/AppHeader'
import { AppSidebar } from '@/components/shared/AppSidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <div className="hidden shrink-0 md:flex">
        <AppSidebar />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
