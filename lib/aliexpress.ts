import { getSupabase } from '@/lib/supabase'

export interface AliExpressSource {
  url: string
  sku: string | null
}

export type AliExpressSources = Record<string, AliExpressSource>

const BUCKET = 'app-data'
const FILE = 'aliexpress-sources.json'

export async function getAliExpressSources(): Promise<AliExpressSources> {
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
      console.error('Error loading aliexpress sources:', res.status)
      return {}
    }
    const text = await res.text()
    return JSON.parse(text) as AliExpressSources
  } catch (e) {
    console.error('Error loading aliexpress sources:', e)
    return {}
  }
}

export async function saveAliExpressSources(sources: AliExpressSources): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(FILE, JSON.stringify(sources, null, 2), {
      contentType: 'application/json',
      upsert: true,
      cacheControl: 'no-cache',
    })

  if (error) {
    console.error('Error saving aliexpress sources:', error)
    return false
  }
  return true
}

export function buildAliExpressUrl(source: AliExpressSource | undefined): string | null {
  if (!source?.url) return null
  if (!source.sku) return source.url
  const sep = source.url.includes('?') ? '&' : '?'
  return `${source.url}${sep}skuId=${source.sku}`
}