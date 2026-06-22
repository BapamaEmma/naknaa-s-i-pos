import { NavLink } from 'react-router-dom'
import {
  ADMIN_NAV_ITEMS,
  APP_NAME,
  APP_TAGLINE,
  MAIN_NAV_ITEMS,
  getNavItemsForRole,
} from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

function NavSection({ title, items }: { title?: string; items: typeof MAIN_NAV_ITEMS }) {
  return (
    <div className="space-y-1">
      {title ? (
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      ) : null}
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </div>
  )
}

export function AppSidebar() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const navItems = getNavItemsForRole(user.role)
  const mainItems = MAIN_NAV_ITEMS.filter((item) => navItems.some((nav) => nav.href === item.href))
  const adminItems = ADMIN_NAV_ITEMS.filter((item) => navItems.some((nav) => nav.href === item.href))

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b px-4 py-5">
        <p className="text-lg font-semibold">{APP_NAME}</p>
        <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-auto p-3">
        <NavSection items={mainItems} />
        {adminItems.length > 0 ? <NavSection title="Administration" items={adminItems} /> : null}
      </nav>
    </aside>
  )
}
