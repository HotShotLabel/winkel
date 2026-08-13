import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getOrder, addOrder } from '@/lib/orders'
import { sendTelegramNotification, formatOrderNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      // Update order with customer info
      const existingOrder = getOrder(session.id)
      if (existingOrder) {
        existingOrder.customerEmail = session.customer_details?.email || ''
        existingOrder.customerName = session.customer_details?.name || ''
        existingOrder.address = session.customer_details?.address ? 
          `${session.customer_details.address.line1}, ${session.customer_details.address.postal_code} ${session.customer_details.address.city}` : ''
        existingOrder.status = 'paid'
        
        // Save updated order
        const db = (await import('@/lib/db')).default
        db.prepare(`
          UPDATE orders SET customerEmail = ?, customerName = ?, address = ?, status = ?
          WHERE id = ?
        `).run(existingOrder.customerEmail, existingOrder.customerName, existingOrder.address, 'paid', session.id)
      }

      // Send Telegram notification
      const notification = formatOrderNotification(existingOrder || session)
      await sendTelegramNotification(notification)

      console.log(`Payment succeeded for session: ${session.id}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
}
