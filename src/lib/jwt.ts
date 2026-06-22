import type { UserRole } from '@/constants/roles'

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  type: 'access' | 'refresh'
  iat: number
  exp: number
}

const JWT_SECRET = 'naknaa-mock-jwt-secret'

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): string {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4)
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
}

export function createMockJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  }

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(fullPayload))
  const signature = base64UrlEncode(`${header}.${body}.${JWT_SECRET}`)

  return `${header}.${body}.${signature}`
}

export function decodeMockJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtPayload
    return payload
  } catch {
    return null
  }
}

export function isMockJwtExpired(token: string): boolean {
  const payload = decodeMockJwt(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now
}

export function isMockJwtValid(token: string): boolean {
  const payload = decodeMockJwt(token)
  if (!payload) return false

  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}
