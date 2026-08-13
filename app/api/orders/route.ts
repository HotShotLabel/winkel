import { NextResponse } from 'next/server'
import { getOrders, updateOrder, updateOrderTracking } from '@/lib/orders'

export async function GET() {
  const orders = await getOrders()
  return NextResponse.json(orders)
}

export async function PUT(request: Request) {
  try {
    const { orderId, trackingCode } = await request.json()
    const order = await updateOrderTracking(orderId, trackingCode)
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
