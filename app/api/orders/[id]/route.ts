import { NextResponse } from 'next/server'
import { getOrder } from '@/lib/orders'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  if (!order) {
    return NextResponse.json({ error: 'Order niet gevonden' }, { status: 404 })
  }

  // Optionele email-check: alleen als email query param meegegeven is
  const url = new URL(request.url)
  const email = url.searchParams.get('email')

  if (email && order.customer_email !== email) {
    return NextResponse.json({ error: 'Ongeldige email' }, { status: 403 })
  }

  return NextResponse.json(order)
}
