import { getSupabase } from '@/lib/supabase'

export interface Coupon {
  code: string
  discount_pct: number
  active: boolean
  max_uses: number
  used_count: number
  expires_at: string | null
  created_at: string
}

export interface CouponValidation {
  valid: boolean
  reason?: 'not_found' | 'inactive' | 'expired' | 'max_uses'
  coupon?: Coupon
  discountPct?: number
  discountAmount?: number
}

// Valideert een coupon tegen de DB. subtotal = bedrag waarop de korting wordt berekend.
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  const normalized = (code || '').trim().toUpperCase()
  if (!normalized || subtotal <= 0) {
    return { valid: false, reason: 'not_found' }
  }

  const { data, error } = await getSupabase()
    .from('coupons')
    .select('*')
    .eq('code', normalized)
    .maybeSingle()

  if (error || !data) {
    return { valid: false, reason: 'not_found' }
  }

  if (!data.active) {
    return { valid: false, reason: 'inactive' }
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  if (data.max_uses > 0 && data.used_count >= data.max_uses) {
    return { valid: false, reason: 'max_uses' }
  }

  const discountAmount = Math.round(subtotal * (data.discount_pct / 100) * 100) / 100
  return {
    valid: true,
    coupon: data,
    discountPct: data.discount_pct,
    discountAmount,
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await getSupabase()
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupons:', error)
    return []
  }
  return data || []
}

export async function createCoupon(input: {
  code: string
  discount_pct: number
  max_uses?: number
  expires_at?: string | null
}): Promise<Coupon | null> {
  const code = (input.code || '').trim().toUpperCase()
  if (!code) return null
  if (!input.discount_pct || input.discount_pct < 1 || input.discount_pct > 100) return null

  const { data, error } = await getSupabase()
    .from('coupons')
    .insert({
      code,
      discount_pct: input.discount_pct,
      max_uses: input.max_uses || 0,
      expires_at: input.expires_at || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating coupon:', error)
    return null
  }
  return data
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('coupons')
    .delete()
    .eq('code', code)

  if (error) {
    console.error('Error deleting coupon:', error)
    return false
  }
  return true
}

// Verhoogt used_count + registreert toepassing op een order.
export async function recordCouponUse(code: string, orderId: string, discountAmount: number): Promise<void> {
  const { data: coupon } = await getSupabase()
    .from('coupons')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (coupon) {
    await getSupabase()
      .from('coupons')
      .update({ used_count: (coupon.used_count || 0) + 1 })
      .eq('code', code)
  }

  await getSupabase()
    .from('order_coupons')
    .insert({ order_id: orderId, code, discount_amount: discountAmount })
}
