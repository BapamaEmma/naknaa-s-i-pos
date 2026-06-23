import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/shared/AppHeader'
import { AppSidebar } from '@/components/shared/AppSidebar'
import { MobileNavDrawer } from '@/components/shared/MobileNavDrawer'

export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-workspace">
      <div className="hidden shrink-0 md:flex">
        <AppSidebar />
      </div>

      <MobileNavDrawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-safe">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
