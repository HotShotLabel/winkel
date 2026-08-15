import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getOrdersByEmail } from '@/lib/orders'

export const dynamic = 'force-dynamic'

// GET /api/contact/orders?email=X — admin: bestellingen van een klant (bij contactgesprek)
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }

  const email = new URL(request.url).searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Email ontbreekt' }, { status: 400 })
  }

  const orders = await getOrdersByEmail(email)

  return NextResponse.json({ email, orders })
}
