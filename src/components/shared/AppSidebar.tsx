import { SidebarNav } from '@/components/shared/SidebarNav'

export function AppSidebar() {
  return (
    <aside className="flex h-full w-[17.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
      <SidebarNav />
    </aside>
  )
}
