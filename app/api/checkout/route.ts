import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder } from '@/lib/orders'
import { getCountry, locationTreeId } from '@/lib/address-map'

export async function POST(request: Request) {
  try {
    const { items, customer } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Geen items in winkelmand' },
        { status: 400 }
      )
    }

    if (!customer?.email || !customer?.firstName || !customer?.lastName || !customer?.phone) {
      return NextResponse.json(
        { error: 'Vul alle verplichte gegevens in' },
        { status: 400 }
      )
    }

    // Adres-mapping voor AliExpress placeorder
    const country = getCountry(customer.country)
    let addressMap: any = null
    if (country) {
      const region = country.regions.find((r) => r.name === customer.province)
      if (!region) {
        return NextResponse.json(
          { error: 'Kies een geldige provincie' },
          { status: 400 }
        )
      }
      addressMap = {
        countryCode: country.code,
        province: region.name,
        locationTreeAddressId: locationTreeId(country, region.code),
        phoneCountry: country.phoneCountry,
        mobileNo: customer.phone.replace(/[^0-9]/g, ''),
      }
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Maak order aan in Supabase
    await addOrder({
      id: orderId,
      customer_email: customer.email,
      customer_name: `${customer.firstName} ${customer.lastName}`,
      address: `${customer.address} ${customer.houseNumber}, ${customer.postalCode} ${customer.city}, ${customer.country}`,
      items: items.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      status: 'pending',
    })

    // Maak Stripe session aan
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['ideal', 'card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mijnwinkel.vercel.app'}/success?orderId=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mijnwinkel.vercel.app'}/checkout?canceled=true`,
      metadata: {
        orderId,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        address: `${customer.address} ${customer.houseNumber}, ${customer.postalCode} ${customer.city}, ${customer.country}`,
        addressMap: addressMap ? JSON.stringify(addressMap) : '',
      },
    })

    return NextResponse.json({ url: session.url, orderId })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    )
  }
}
