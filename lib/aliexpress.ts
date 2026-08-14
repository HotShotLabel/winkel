import { getSupabase } from '@/lib/supabase'

export interface AliExpressSource {
  url: string
  sku: string | null
}

export type AliExpressSources = Record<string, AliExpressSource>

const BUCKET = 'app-data'
const FILE = 'aliexpress-sources.json'

export async function getAliExpressSources(): Promise<AliExpressSources> {
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(FILE)

  if (error || !data) {
    console.error('Error loading aliexpress sources:', error)
    return {}
  }

  try {
    const text = await data.text()
    return JSON.parse(text) as AliExpressSources
  } catch (e) {
    console.error('Error parsing aliexpress sources:', e)
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