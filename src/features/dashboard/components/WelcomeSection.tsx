import { useAuth } from '@/hooks/useAuth'

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
  const name = user?.firstName ?? 'Admin'

  return (
    <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 shadow-sm sm:p-6">
      <p className="text-sm font-medium text-primary">{getGreeting()}, {name}</p>
      <h1 className="mt-1 text-balance text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
        Welcome back to NakNaa Electronics.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Today is {getFormattedDate()}.</p>
    </div>
  )
}
