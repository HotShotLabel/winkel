import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder, updateOrder } from '@/lib/orders'

export async function POST(request: Request) {
  try {
    const { items, customer } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Geen items in winkelmand' },
        { status: 400 }
      )
    }

    if (!customer?.email || !customer?.firstName || !customer?.lastName) {
      return NextResponse.json(
        { error: 'Vul alle verplichte gegevens in' },
        { status: 400 }
      )
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Maak order eerst aan in onze database
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    addOrder({
      id: orderId,
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      address: `${customer.address} ${customer.houseNumber}, ${customer.postalCode} ${customer.city}, ${customer.country}`,
      items: items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    // Maak Stripe session aan
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['ideal', 'card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?orderId=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?canceled=true`,
      metadata: {
        orderId,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        address: `${customer.address} ${customer.houseNumber}, ${customer.postalCode} ${customer.city}, ${customer.country}`,
      },
    })

    // Update order met Stripe session ID
    updateOrder(orderId, { status: 'pending' })

    return NextResponse.json({ url: session.url, orderId })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    )
  }
}
