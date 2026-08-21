import { getSupabase } from '@/lib/supabase'

export interface Review {
  id: number
  product_id: string
  name: string
  rating: number
  comment: string
  created_at: string
}

export async function getReviews(productId: string): Promise<Review[]> {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  return (data as Review[]) || []
}

export async function getReviewSummary(): Promise<{ avg: number; count: number }> {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select('rating')
    .eq('approved', true)

  if (error || !data || data.length === 0) {
    return { avg: 0, count: 0 }
  }
  const ratings = data.map(r => Number(r.rating))
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  return { avg, count: ratings.length }
}

export async function getRecentReviews(limit: number): Promise<Review[]> {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent reviews:', error)
    return []
  }
  return (data as Review[]) || []
}

export async function getReviewAverages(): Promise<Record<string, { avg: number; count: number }>> {
  const { data, error } = await getSupabase()
    .from('reviews')
    .select('product_id, rating')
    .eq('approved', true)

  if (error || !data) return {}
  const map: Record<string, number[]> = {}
  for (const r of data) {
    if (!map[r.product_id]) map[r.product_id] = []
    map[r.product_id].push(Number(r.rating))
  }
  const result: Record<string, { avg: number; count: number }> = {}
  for (const [pid, ratings] of Object.entries(map)) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
    result[pid] = { avg: Math.round(avg * 10) / 10, count: ratings.length }
  }
  return result
}

export async function addReview(input: {
  product_id: string
  name: string
  rating: number
  comment: string
}): Promise<Review | null> {
  const { data, error } = await getSupabase()
    .from('reviews')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('Error adding review:', error)
    return null
  }
  return data as Review
}
