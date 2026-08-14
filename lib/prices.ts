import { getSupabase } from '@/lib/supabase'

const BUCKET = 'app-data'
const FILE = 'product-prices.json'

export interface ProductPrice {
  old_price?: number | null
}

export type ProductPrices = Record<string, ProductPrice>

export async function getProductPrices(): Promise<ProductPrices> {
  const supabase = getSupabase()
  const url = process.env.SUPABASE_URL
  if (!url) return {}

  // Eigen fetch met cache-breaker: Supabase CDN cachet objecten (max-age=3600),
  // een query-param forceert altijd de verse versie.
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
      console.error('Error loading product prices:', res.status)
      return {}
    }
    const text = await res.text()
    return JSON.parse(text) as ProductPrices
  } catch (e) {
    console.error('Error loading product prices:', e)
    return {}
  }
}

export async function saveProductPrices(prices: ProductPrices): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(FILE, JSON.stringify(prices, null, 2), {
      contentType: 'application/json',
      upsert: true,
      cacheControl: 'no-cache',
    })

  if (error) {
    console.error('Error saving product prices:', error)
    return false
  }
  return true
}