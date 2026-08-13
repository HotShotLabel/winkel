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
        const updateData: any = {
          status: 'paid',
        }
        if (session.customer_details?.email) updateData.customer_email = session.customer_details.email
        if (session.customer_details?.name) updateData.customer_name = session.customer_details.name
        const addr = session.customer_details?.address
        if (addr?.line1) {
          updateData.address = `${addr.line1}, ${addr.postal_code} ${addr.city}`
        }

        const order = await updateOrder(orderId, updateData)

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
