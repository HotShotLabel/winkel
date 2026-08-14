import { NextResponse } from 'next/server'
import { getProductPrices, saveProductPrices } from '@/lib/prices'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const prices = await getProductPrices()
  return NextResponse.json(prices)
}

export async function PUT(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }
    const prices = await request.json()
    const ok = await saveProductPrices(prices)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to save prices' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save prices' }, { status: 500 })
  }
}