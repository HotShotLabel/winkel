import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('supabaseUrl is required. Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.')
  }
  client = createClient(url, key)
  return client
}
