import { createClient } from '@supabase/supabase-js'

export const SUPABASE_STATE_TABLE = 'mossi_state'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabaseClient

const normalizeSupabaseUrl = (url) =>
  url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey)

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(normalizeSupabaseUrl(supabaseUrl), supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return supabaseClient
}
