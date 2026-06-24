import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MOCK_CREDENTIALS } from '@/constants/auth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/features/auth/hooks/use-auth'

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
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
      await login(values)
      onSuccess?.()
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

      if (status === 403 && !apiMessage) {
        message =
          'Cannot reach the API (port conflict). Start the backend on http://localhost:5080 and restart the frontend dev server.'
      } else if (
        !status &&
        (apiMessage === 'Network Error' ||
          apiMessage.toLowerCase().includes('network') ||
          apiMessage.toLowerCase().includes('timeout'))
      ) {
        message =
          'Cannot connect to the API. Start PostgreSQL, then run the backend: cd backend && dotnet run --project src/NaknaaErp.Api'
      }

      setError(message)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
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
