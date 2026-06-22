export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'naknaa_access_token',
  REFRESH_TOKEN: 'naknaa_refresh_token',
  USER: 'naknaa_user',
} as const

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export const APP_ENV = import.meta.env.MODE
