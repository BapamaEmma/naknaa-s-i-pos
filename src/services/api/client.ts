import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/constants/api'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/services/api/types'
import { tokenStorage } from '@/services/storage/tokenStorage'
import type { ApiError } from '@/types/common'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableRequest | undefined
    const isUnauthorized = error.response?.status === 401
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh-token')

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true

      const accessToken = tokenStorage.getAccessToken()
      const refreshToken = tokenStorage.getRefreshToken()

      if (accessToken && refreshToken) {
        try {
          const { data } = await axios.post<ApiResponse<{
            accessToken: string
            refreshToken: string
            user: unknown
          }>>(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.auth.refresh}`,
            { accessToken, refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          )

          if (data.success && data.data) {
            tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken)
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
            return apiClient(originalRequest)
          }
        } catch {
          tokenStorage.clearTokens()
          window.dispatchEvent(new Event('auth:session-expired'))
        }
      }
    }

    if (error.response?.status === 401 && !isAuthRoute) {
      tokenStorage.clearTokens()
      window.dispatchEvent(new Event('auth:session-expired'))
    }

    const apiError: ApiError = {
      message: error.response?.data?.message ?? error.message ?? 'An unexpected error occurred',
      code: error.response?.data?.code,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    }

    return Promise.reject(apiError)
  },
)
