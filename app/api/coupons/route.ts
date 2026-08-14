import { NextResponse } from 'next/server'
import { validateCoupon, getCoupons, createCoupon, deleteCoupon } from '@/lib/coupons'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// POST /api/coupons — publiek: coupon valideren
// body: { code, subtotal }
export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json()
    const result = await validateCoupon(code, Number(subtotal) || 0)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 400 })
  }
}

// GET /api/coupons — admin: alle coupons
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }
  const coupons = await getCoupons()
  return NextResponse.json(coupons)
}

// PUT /api/coupons — admin: nieuwe coupon aanmaken
export async function PUT(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }
  try {
    const input = await request.json()
    const coupon = await createCoupon(input)
    if (!coupon) {
      return NextResponse.json({ error: 'Kon coupon niet aanmaken (controleer code/korting)' }, { status: 400 })
    }
    return NextResponse.json(coupon)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

// DELETE /api/coupons?code=X — admin: coupon verwijderen
export async function DELETE(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }
  try {
    const code = new URL(request.url).searchParams.get('code')
    if (!code) {
      return NextResponse.json({ error: 'Geen code' }, { status: 400 })
    }
    const ok = await deleteCoupon(code)
    if (!ok) {
      return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
