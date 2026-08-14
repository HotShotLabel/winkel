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
