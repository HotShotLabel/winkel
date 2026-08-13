import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder, updateOrder } from '@/lib/orders'
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
        const order = await updateOrder(orderId, {
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name,
          address: session.customer_details?.address
            ? `${session.customer_details.address.line1}, ${session.customer_details.address.postal_code} ${session.customer_details.address.city}`
            : undefined,
          status: 'paid',
        })

        if (order) {
          const notification = formatOrderNotification(order)
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
