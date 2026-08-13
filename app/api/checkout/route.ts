import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder } from '@/lib/orders'

export async function POST(request: Request) {
  try {
    const { items } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Geen items in winkelmand' },
        { status: 400 }
      )
    }

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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart?canceled=true`,
      metadata: {
        items: JSON.stringify(items),
      },
    })

    // Sla order op in onze database
    addOrder({
      id: session.id,
      customerEmail: '', // Wordt gevuld na betaling via webhook
      customerName: '',
      address: '',
      items: items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    )
  }
}
