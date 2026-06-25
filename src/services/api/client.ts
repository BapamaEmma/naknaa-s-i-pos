import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/constants/api'
import { isSupabaseAuthEnabled } from '@/constants/supabase'
import { supabase } from '@/lib/supabase/client'
import { authService } from '@/services/auth/authService'
import { tokenStorage } from '@/services/storage/tokenStorage'
import type { ApiError } from '@/types/common'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

type ProblemDetails = {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

function getBearerToken(headerValue: unknown): string | null {
  if (typeof headerValue !== 'string') return null
  return headerValue.replace(/^Bearer\s+/i, '').trim() || null
}

function toApiError(error: AxiosError<ProblemDetails>): ApiError {
  const data = error.response?.data
  let message = data?.message ?? data?.title ?? error.message ?? 'An unexpected error occurred'

  if (data?.errors) {
    const firstFieldError = Object.values(data.errors).flat()[0]
    if (firstFieldError) {
      message = firstFieldError
    }
  }

  return {
    message,
    code: (data as ApiError | undefined)?.code,
    status: error.response?.status,
    errors: data?.errors ?? (data as ApiError | undefined)?.errors,
  }
}

async function clearAuthSession(): Promise<void> {
  authService.clearSession()
  if (isSupabaseAuthEnabled) {
    await supabase.auth.signOut()
  }
}

async function getAccessTokenForRequest(): Promise<string | null> {
  if (isSupabaseAuthEnabled) {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  return tokenStorage.getAccessToken()
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessTokenForRequest()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetails>) => {
    const originalRequest = error.config as RetryableRequest | undefined
    const isUnauthorized = error.response?.status === 401
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/resolve-login') ||
      originalRequest?.url?.includes('/auth/me')

    if (isUnauthorized && originalRequest && !isAuthRoute) {
      const requestToken = getBearerToken(originalRequest.headers.Authorization)
      const currentAccessToken = await getAccessTokenForRequest()

      // Ignore stale 401s from an older session after a fresh login.
      if (requestToken && currentAccessToken && requestToken !== currentAccessToken) {
        return Promise.reject(toApiError(error))
      }

      if (!originalRequest._retry && currentAccessToken) {
        originalRequest._retry = true

        try {
          const refreshedToken = await authService.refreshAccessToken()

          if (refreshedToken) {
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`
            return apiClient(originalRequest)
          }
        } catch {
          await clearAuthSession()
          window.dispatchEvent(new Event('auth:session-expired'))
          return Promise.reject(toApiError(error))
        }
      }

      if (!requestToken || requestToken === currentAccessToken) {
        await clearAuthSession()
        window.dispatchEvent(new Event('auth:session-expired'))
      }
    }

    return Promise.reject(toApiError(error))
  },
)
