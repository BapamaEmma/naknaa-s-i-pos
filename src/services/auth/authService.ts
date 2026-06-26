import { STORAGE_KEYS } from '@/constants/api'
import { isSupabaseAuthEnabled } from '@/constants/supabase'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { apiGet, apiPost } from '@/services/api/http'
import { mapAuthUser } from '@/services/api/mappers'
import { supabase } from '@/lib/supabase/client'
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

interface AuthUserDto {
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

interface TokenResponseDto {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: AuthUserDto
}

function persistUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

function persistLegacyTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
}

function persistFromTokenResponse(response: TokenResponseDto): AuthResponse {
  const authResponse: AuthResponse = {
    user: mapAuthUser(response.user),
    tokens: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  }

  persistLegacyTokens(authResponse.tokens.accessToken, authResponse.tokens.refreshToken)
  persistUser(authResponse.user)

  return authResponse
}

async function resolveLoginEmail(identifier: string): Promise<string> {
  const trimmed = identifier.trim()
  if (trimmed.includes('@')) {
    return trimmed
  }

  const result = await apiGet<{ email: string }>(API_ENDPOINTS.auth.resolveLogin, {
    params: { identifier: trimmed },
  })

  return result.email
}

async function fetchCurrentUserProfile(): Promise<User> {
  const profile = await apiGet<AuthUserDto>(API_ENDPOINTS.auth.me)
  const user = mapAuthUser(profile)
  persistUser(user)
  return user
}

export const authService = {
  isSupabaseAuthEnabled,

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
    persistLegacyTokens(response.tokens.accessToken, response.tokens.refreshToken)
    persistUser(response.user)
  },

  clearSession(): void {
    tokenStorage.clearTokens()
  },

  async restoreSession(): Promise<User | null> {
    if (isSupabaseAuthEnabled) {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        this.clearSession()
        return null
      }

      persistLegacyTokens(data.session.access_token, data.session.refresh_token)

      try {
        return await fetchCurrentUserProfile()
      } catch {
        await supabase.auth.signOut()
        this.clearSession()
        return null
      }
    }

    const accessToken = this.getAccessToken()
    if (!accessToken) {
      this.clearSession()
      return null
    }

    try {
      return await fetchCurrentUserProfile()
    } catch {
      this.clearSession()
      return null
    }
  },

  async refreshUserProfile(): Promise<User | null> {
    const accessToken = this.getAccessToken()
    if (!accessToken) {
      return null
    }

    try {
      return await fetchCurrentUserProfile()
    } catch {
      return null
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (isSupabaseAuthEnabled) {
      const email = await resolveLoginEmail(credentials.email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      })

      if (error || !data.session) {
        throw {
          message: error?.message ?? 'Invalid email or password.',
          status: 401,
        }
      }

      persistLegacyTokens(data.session.access_token, data.session.refresh_token)
      const user = await fetchCurrentUserProfile()

      return {
        user,
        tokens: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
      }
    }

    const response = await apiPost<TokenResponseDto>(API_ENDPOINTS.auth.login, {
      email: credentials.email.trim(),
      password: credentials.password.trim(),
    })

    return persistFromTokenResponse(response)
  },

  async logout(): Promise<void> {
    try {
      if (isSupabaseAuthEnabled) {
        await supabase.auth.signOut()
      } else {
        await apiPost(API_ENDPOINTS.auth.logout)
      }
    } catch {
      // Ignore network errors during logout.
    } finally {
      this.clearSession()
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    if (isSupabaseAuthEnabled) {
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) {
        this.clearSession()
        return null
      }

      persistLegacyTokens(data.session.access_token, data.session.refresh_token)
      return data.session.access_token
    }

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
