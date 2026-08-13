import { NextResponse } from 'next/server'
import { getOrder } from '@/lib/orders'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const order = getOrder(params.id)
  if (!order) {
    return NextResponse.json({ error: 'Order niet gevonden' }, { status: 404 })
  }

  // Check email from query params
  const url = new URL(request.url)
  const email = url.searchParams.get('email')
  
  if (!email || order.customerEmail !== email) {
    return NextResponse.json({ error: 'Ongeldige email' }, { status: 403 })
  }

  return NextResponse.json(order)
}
