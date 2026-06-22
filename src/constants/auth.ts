export const AUTH_API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
} as const

export const TOKEN_EXPIRY = {
  ACCESS: 15 * 60,
  REFRESH: 7 * 24 * 60 * 60,
} as const

export const MOCK_CREDENTIALS = {
  admin: {
    email: 'admin@naknaa.com',
    password: 'password',
  },
  storekeeper: {
    email: 'storekeeper@naknaa.com',
    password: 'password',
  },
} as const
