import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('supabaseUrl is required. Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.')
  }
  // Eigen fetch met cache: 'no-store': Next.js cachet anders fetch-verzoeken in
  // server-component-renders (zelfs met force-dynamic), waardoor pagina's stale
  // producten tonen terwijl API-routes wel live data geven.
  client = createClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
  return client
}
