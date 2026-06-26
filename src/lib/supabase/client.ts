import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseAuthEnabled, SUPABASE_CONFIG } from '@/constants/supabase'

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return isSupabaseAuthEnabled
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!client) {
    client = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }

  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseClient()
    if (!instance) {
      throw new Error(
        'Supabase Auth is not configured. Set VITE_SUPABASE_ANON_KEY or use ERP login.',
      )
    }

    return Reflect.get(instance, prop)
  },
})
