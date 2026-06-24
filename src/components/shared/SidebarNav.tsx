import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import naknaaLogo from '@/assets/naknaa-logo.png'
import {
  ADMIN_NAV_ITEMS,
  APP_NAME,
  APP_TAGLINE,
  MAIN_NAV_ITEMS,
  getNavItemsForRole,
} from '@/constants/navigation'
import { ROLE_LABELS } from '@/constants/roles'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface SidebarNavProps {
  onNavigate?: () => void
  showBrand?: boolean
  showUser?: boolean
  className?: string
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title?: string
  items: typeof MAIN_NAV_ITEMS
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-1">
      {title ? (
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/45">
          {title}
        </p>
      ) : null}
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 py-3 text-base transition-all duration-200',
              isActive
                ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm ring-1 ring-white/10'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
            )
          }
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-5 w-5 shrink-0 opacity-90" />
            <span>{item.title}</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
        </NavLink>
      ))}
    </div>
  )
}

export function SidebarNav({
  onNavigate,
  showBrand = true,
  showUser = false,
  className,
}: SidebarNavProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const navItems = getNavItemsForRole(user.role)
  const mainItems = MAIN_NAV_ITEMS.filter((item) => navItems.some((nav) => nav.href === item.href))
  const adminItems = ADMIN_NAV_ITEMS.filter((item) => navItems.some((nav) => nav.href === item.href))

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {showBrand ? (
        <div className="flex flex-col items-center border-b border-sidebar-border px-4 py-5 text-center">
          <img
            src={naknaaLogo}
            alt={APP_NAME}
            className="mb-3 h-20 w-auto max-w-full object-contain sm:h-24"
          />
          <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">{APP_NAME}</p>
          <p className="text-xs text-sidebar-foreground/55">{APP_TAGLINE}</p>
        </div>
      ) : null}

      <nav className="flex-1 space-y-6 overflow-auto p-3">
        <NavSection items={mainItems} onNavigate={onNavigate} />
        {adminItems.length > 0 ? (
          <NavSection title="Administration" items={adminItems} onNavigate={onNavigate} />
        ) : null}
      </nav>

      {showUser ? (
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/55">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
