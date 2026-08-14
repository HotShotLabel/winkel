import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/magiclink'
import { getOrdersByEmail } from '@/lib/orders'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Sessie verlopen, log opnieuw in' }, { status: 401 })
  }

  const orders = await getOrdersByEmail(payload.email)

  return NextResponse.json({ email: payload.email, orders })
}