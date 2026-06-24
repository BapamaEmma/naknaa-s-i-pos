import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MOCK_CREDENTIALS } from '@/constants/auth'
import { getDefaultAuthenticatedRoute } from '@/constants/routes'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/features/auth/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: MOCK_CREDENTIALS.admin.email,
      password: MOCK_CREDENTIALS.admin.password,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)

    try {
      const session = await login(values)
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        getDefaultAuthenticatedRoute(session.user.role)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const status =
        typeof err === 'object' && err && 'status' in err
          ? Number((err as { status?: number }).status)
          : undefined
      const apiMessage =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message?: string }).message ?? '')
          : ''

      let message = apiMessage || 'Unable to sign in. Please check your credentials and try again.'

      if (status === 401) {
        message = 'Invalid email/username or password.'
      } else if (status === 403 && !apiMessage) {
        message =
          'Cannot reach the API (port conflict). Start the backend on http://localhost:5080 and restart the frontend dev server.'
      } else if (
        !status &&
        (apiMessage === 'Network Error' ||
          apiMessage.toLowerCase().includes('network') ||
          apiMessage.toLowerCase().includes('timeout'))
      ) {
        message =
          'Cannot connect to the API. Start PostgreSQL (`docker compose up -d` in backend), then run the API on port 5080.'
      } else if (status === 503) {
        message =
          apiMessage ||
          'Database unavailable. Start PostgreSQL with `docker compose up -d` in the backend folder.'
      }

      setError(message)
    }
  })

  const fillCashierDemo = () => {
    void login({
      email: MOCK_CREDENTIALS.cashierAccra.email,
      password: MOCK_CREDENTIALS.cashierAccra.password,
    })
      .then((session) => {
        navigate(getDefaultAuthenticatedRoute(session.user.role), { replace: true })
      })
      .catch((err: { message?: string; status?: number }) => {
        setError(
          err.status === 401
            ? 'Invalid cashier credentials. Restart the backend so demo cashier accounts are created.'
            : err.message || 'Unable to sign in as cashier.',
        )
      })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email or username
        </label>
        <input
          id="email"
          type="text"
          autoComplete="username"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          {...register('email')}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts</p>
        <p className="mt-1">Admin: admin@naknaa.com / password</p>
        <p>Cashier: cashier.accra@naknaa.com / password (or username `cashier.accra`)</p>
        <button
          type="button"
          onClick={fillCashierDemo}
          disabled={isLoading}
          className="mt-2 text-primary underline-offset-2 hover:underline disabled:opacity-50"
        >
          Sign in as cashier
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" /> : 'Sign in'}
      </button>
    </form>
  )
}
