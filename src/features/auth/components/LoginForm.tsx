import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getDefaultAuthenticatedRoute } from '@/constants/routes'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/features/auth/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().trim().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoggingIn } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
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
      } else if (status === 400) {
        message = apiMessage || 'Enter a valid email or username and password.'
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
          'Cannot connect to the API. Ensure the backend is running on port 5080 and Supabase is configured.'
      } else if (status === 503) {
        message =
          apiMessage ||
          'Database unavailable. Check your Supabase connection in backend/src/NaknaaErp.Api/appsettings.Development.local.json.'
      }

      setError(message)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email or username
        </label>
        <input
          id="email"
          type="text"
          autoComplete="off"
          spellCheck={false}
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
          autoComplete="new-password"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoggingIn}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoggingIn ? <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" /> : 'Sign in'}
      </button>
    </form>
  )
}
