import { useAuth } from '@/hooks/useAuth'

function getDisplayName(firstName?: string, lastName?: string): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim()
  return name || 'Admin'
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en-GH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export function WelcomeSection() {
  const { user } = useAuth()
  const name = getDisplayName(user?.firstName, user?.lastName)

  return (
    <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 shadow-sm sm:p-6">
      <p className="text-sm font-medium text-primary">{getGreeting()}, {name}</p>
      <h1 className="mt-1 text-balance bg-gradient-to-r from-primary via-kpi-purple to-kpi-blue bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-4xl lg:text-5xl">
        Welcome back to NakNaa Electronics.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Today is {getFormattedDate()}.</p>
    </div>
  )
}
