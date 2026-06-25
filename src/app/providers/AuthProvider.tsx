import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/constants/api'
import { isSupabaseAuthEnabled } from '@/constants/supabase'
import { supabase } from '@/lib/supabase/client'
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
  const [isInitializing, setIsInitializing] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      const restoredUser = await authService.restoreSession()
      if (isMounted) {
        setUser(restoredUser)
        setIsInitializing(false)
      }
    }

    void initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseAuthEnabled) {
      return
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        authService.clearSession()
        setUser(null)
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.access_token)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token)

        try {
          const profile = await authService.restoreSession()
          setUser(profile)
        } catch {
          authService.clearSession()
          setUser(null)
        }
      }
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
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
    setIsLoggingIn(true)

    try {
      const session = await authService.login(credentials)
      setUser(session.user)
      return session
    } finally {
      setIsLoggingIn(false)
    }
  }, [])

  const logout = useCallback(() => {
    void authService.logout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const profile = await authService.refreshUserProfile()
    setUser(profile)
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
      isLoading: isInitializing,
      isLoggingIn,
      login,
      logout,
      refreshUser,
      hasRole,
    }),
    [user, isInitializing, isLoggingIn, login, logout, refreshUser, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
