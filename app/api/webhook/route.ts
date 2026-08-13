import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getOrder, updateOrder } from '@/lib/orders'
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
      const orderId = session.metadata?.orderId

      if (orderId) {
        const order = getOrder(orderId)
        if (order) {
          updateOrder(orderId, {
            customerEmail: session.customer_details?.email || order.customerEmail,
            customerName: session.customer_details?.name || order.customerName,
            address: session.customer_details?.address ? 
              `${session.customer_details.address.line1}, ${session.customer_details.address.postal_code} ${session.customer_details.address.city}` : order.address,
            status: 'paid',
          })
        }

        // Send Telegram notification
        const updatedOrder = getOrder(orderId)
        if (updatedOrder) {
          const notification = formatOrderNotification(updatedOrder)
          await sendTelegramNotification(notification)
        }
      }

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
