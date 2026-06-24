import type { UserRole } from '@/constants/roles'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: import('./user').User
  tokens: AuthTokens
}

export interface AuthState {
  user: import('./user').User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}
