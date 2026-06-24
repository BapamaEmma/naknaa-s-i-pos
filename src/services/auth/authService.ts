import { STORAGE_KEYS } from '@/constants/api'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiPost } from '@/services/api/http'
import { mapAuthUser } from '@/services/api/mappers'
import { tokenStorage } from '@/services/storage/tokenStorage'
import type { AuthResponse, LoginCredentials } from '@/types/auth'
import type { User } from '@/types/user'

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

interface TokenResponseDto {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    roleName: string
    branchId: string
    branchName: string
    permissions: string[]
  }
}

function persistFromTokenResponse(response: TokenResponseDto): AuthResponse {
  const authResponse: AuthResponse = {
    user: mapAuthUser(response.user),
    tokens: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  }

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.tokens.accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.tokens.refreshToken)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user))

  return authResponse
}

export const authService = {
  getAccessToken(): string | null {
    return tokenStorage.getAccessToken()
  },

  getRefreshToken(): string | null {
    return tokenStorage.getRefreshToken()
  },

  getStoredUser(): User | null {
    return parseStoredUser(localStorage.getItem(STORAGE_KEYS.USER))
  },

  persistSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
  },

  clearSession(): void {
    tokenStorage.clearTokens()
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiPost<TokenResponseDto>(API_ENDPOINTS.auth.login, {
      email: credentials.email.trim(),
      password: credentials.password,
    })

    return persistFromTokenResponse(response)
  },

  async logout(): Promise<void> {
    try {
      await apiPost(API_ENDPOINTS.auth.logout)
    } catch {
      // Ignore network errors during logout.
    } finally {
      this.clearSession()
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    const accessToken = tokenStorage.getAccessToken()
    const refreshToken = tokenStorage.getRefreshToken()

    if (!accessToken || !refreshToken) return null

    try {
      const response = await apiPost<TokenResponseDto>(API_ENDPOINTS.auth.refresh, {
        accessToken,
        refreshToken,
      })
      const session = persistFromTokenResponse(response)
      return session.tokens.accessToken
    } catch {
      this.clearSession()
      return null
    }
  },
}
