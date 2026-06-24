import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services/auth/authService'
import type { AuthContextValue, LoginCredentials } from '@/types/auth'
import type { User } from '@/types/user'
import type { UserRole } from '@/constants/roles'

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = authService.getStoredUser()
    const accessToken = authService.getAccessToken()

    if (storedUser && accessToken) {
      setUser(storedUser)
    } else {
      authService.clearSession()
      setUser(null)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      authService.clearSession()
      setUser(null)
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)

    try {
      const session = await authService.login(credentials)
      setUser(session.user)
      return session
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    void authService.logout()
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false
      const allowedRoles = Array.isArray(roles) ? roles : [roles]
      return allowedRoles.includes(user.role)
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
