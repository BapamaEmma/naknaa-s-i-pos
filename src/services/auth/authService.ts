import { STORAGE_KEYS } from '@/constants'
import { normalizeUserRole } from '@/constants/roles'
import type { AuthResponse } from '@/types/auth'
import type { User } from '@/types/user'

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null

  try {
    const user = JSON.parse(raw) as User
    return {
      ...user,
      role: normalizeUserRole(user.role),
    }
  } catch {
    return null
  }
}

export const authService = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
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
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  async refreshAccessToken(): Promise<string | null> {
    return null
  },
}
