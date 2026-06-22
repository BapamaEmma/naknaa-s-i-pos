import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { USER_ROLES, type UserRole } from '@/constants/roles'
import { authService } from '@/services/auth/authService'
import type { AuthContextValue, LoginCredentials } from '@/types/auth'
import type { User } from '@/types/user'

export const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USER: User = {
  id: 'demo-admin',
  email: 'admin@naknaa.com',
  firstName: 'NakNaa',
  lastName: 'Admin',
  role: USER_ROLES.ADMIN,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = authService.getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)

    try {
      // Placeholder: replace with authService.login when API is ready
      await new Promise((resolve) => setTimeout(resolve, 600))

      const mockResponse = {
        user: {
          ...DEMO_USER,
          email: credentials.email,
        },
        tokens: {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
        },
      }

      authService.persistSession(mockResponse)
      setUser(mockResponse.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.clearSession()
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
