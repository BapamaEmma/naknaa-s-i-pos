import { Bell, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

interface AppHeaderProps {
  onMenuClick?: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, logout } = useAuth()

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}` : 'NA'

  return (
    <header className="safe-top flex h-16 shrink-0 items-center border-b border-border/60 bg-card px-4 md:justify-end md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-auto shrink-0 text-muted-foreground md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden text-muted-foreground sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{user?.email ?? ''}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-kpi-purple text-sm font-semibold text-white shadow-sm">
            {initials}
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-kpi-purple text-xs font-semibold text-white shadow-sm sm:hidden">
          {initials}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
