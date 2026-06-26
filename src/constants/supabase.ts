export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL ?? '',
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
} as const

export const isSupabaseAnonKeyValid =
  SUPABASE_CONFIG.ANON_KEY.startsWith('eyJ') && SUPABASE_CONFIG.ANON_KEY.length > 100

export const isSupabaseAuthEnabled = Boolean(
  SUPABASE_CONFIG.URL && isSupabaseAnonKeyValid,
)
