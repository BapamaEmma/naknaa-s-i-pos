import { ROLE_LABELS } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div>
        <p className="text-sm font-medium">
          {user ? `${user.firstName} ${user.lastName}` : 'NakNaa POS'}
        </p>
        {user ? (
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={logout}
        className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        Sign out
      </button>
    </header>
  )
}
