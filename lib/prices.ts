import { getSupabase } from '@/lib/supabase'

const BUCKET = 'app-data'
const FILE = 'product-prices.json'

export interface ProductPrice {
  old_price?: number | null
}

export type ProductPrices = Record<string, ProductPrice>

export async function getProductPrices(): Promise<ProductPrices> {
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(FILE)

  if (error || !data) {
    return {}
  }

  try {
    const text = await data.text()
    return JSON.parse(text) as ProductPrices
  } catch (e) {
    console.error('Error parsing product prices:', e)
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
    })

  if (error) {
    console.error('Error saving product prices:', error)
    return false
  }
  return true
}
