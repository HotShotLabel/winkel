import { getSupabase } from '@/lib/supabase'

export type Season = 'zomer' | 'winter'

export type ProductSeasons = Record<string, Season>

const BUCKET = 'app-data'
const FILE = 'product-seasons.json'

export async function getProductSeasons(): Promise<ProductSeasons> {
  const url = process.env.SUPABASE_URL
  if (!url) return {}

  // Eigen fetch met cache-breaker: Supabase CDN cachet objecten (max-age=3600),
  // een query-param forceert altijd de verse versie. (Les 14-8-2026)
  try {
    const res = await fetch(
      `${url}/storage/v1/object/${BUCKET}/${FILE}?cb=${Date.now()}`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) {
      // Bestand bestaat nog niet → geen seizoenen
      return {}
    }
    const text = await res.text()
    return JSON.parse(text) as ProductSeasons
  } catch (e) {
    console.error('Error loading product seasons:', e)
    return {}
  }
}

export async function saveProductSeasons(seasons: ProductSeasons): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(FILE, JSON.stringify(seasons, null, 2), {
      contentType: 'application/json',
      upsert: true,
      cacheControl: 'no-cache',
    })

  if (error) {
    console.error('Error saving product seasons:', error)
    return false
  }
  return true
}
