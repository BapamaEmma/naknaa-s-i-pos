import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { USER_ROLES, normalizeUserRole, type UserRole } from '@/constants/roles'
import { authService } from '@/services/auth/authService'
import { userService } from '@/services/users/userService'
import type { AuthContextValue, LoginCredentials } from '@/types/auth'
import type { User } from '@/types/user'

export const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_ADMIN: User = {
  id: 'user-admin-001',
  email: 'admin@naknaa.com',
  firstName: 'NakNaa',
  lastName: 'Admin',
  role: USER_ROLES.ADMIN,
  branchId: 'branch-main',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

async function resolveLoginUser(credentials: LoginCredentials): Promise<User> {
  const email = credentials.email.trim().toLowerCase()
  const users = await userService.getUsers({ limit: 100 })
  const match = users.data.find((entry) => entry.email.toLowerCase() === email)

  if (match) {
    const detail = await userService.getUserById(match.id)

    if (detail.status !== 'active') {
      throw new Error('This account is not active.')
    }

    return {
      id: detail.id,
      email: detail.email,
      firstName: detail.firstName,
      lastName: detail.lastName,
      role: normalizeUserRole(detail.roleId),
      branchId: detail.branchId,
      isActive: detail.status === 'active',
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
    }
  }

  if (email === DEMO_ADMIN.email) {
    return { ...DEMO_ADMIN, email: credentials.email.trim() }
  }

  throw new Error('Invalid email or password.')
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
      await new Promise((resolve) => setTimeout(resolve, 600))

      if (credentials.password !== 'password') {
        throw new Error('Invalid email or password.')
      }

      const loggedInUser = await resolveLoginUser(credentials)

      const mockResponse = {
        user: loggedInUser,
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
