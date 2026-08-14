import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder, updateOrder, getOrder } from '@/lib/orders'
import { sendTelegramNotification, formatOrderNotification, sendEmail, orderConfirmationHtml } from '@/lib/notifications'
import {
  getProductSources,
  getFreightOption,
  placeOrder,
  getAliexpressOrderLinks,
  saveAliexpressOrderLink,
  saveOrderAddress,
} from '@/lib/aliexpress-orders'

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
        // Adres-mapping (countryCode/province/locationTreeAddressId/phoneCountry/mobileNo) voor placeorder
        const addressMapRaw = session.metadata?.addressMap
        if (addressMapRaw) {
          // DB-kolom address_map bestaat niet -> opslaan in Storage
          try {
            await saveOrderAddress(orderId, addressMapRaw)
          } catch (e: any) {
            console.error('Adres opslaan mislukt:', e.message)
          }
        }

        const order = await updateOrder(orderId, updateData)

        if (order) {
          const notification = formatOrderNotification(order)
          await sendTelegramNotification(notification)

          if (order.customer_email) {
            await sendEmail(
              order.customer_email,
              `Bestelling bevestigd - ${order.id}`,
              orderConfirmationHtml(order)
            )
          }

          // AliExpress placeorder op klantadres (onbetaald, try_to_pay:false).
          // Betalen doet de verkoper handmatig in het AliExpress-account.
          if (addressMapRaw) {
            await placeOrderForShopOrder(orderId, order, addressMapRaw)
          }
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

function extractStreet(address?: string): string {
  if (!address) return ''
  return address.split(',')[0].trim()
}

function extractZip(address?: string): string {
  if (!address) return ''
  const m = address.match(/\b\d{4}\s?[A-Z]{2}\b/)
  return m ? m[0].replace(/\s/g, '') : ''
}

function extractCity(address?: string): string {
  if (!address) return ''
  const zipMatch = address.match(/\b\d{4}\s?[A-Z]{2}\s+(.+?)\s*$/)
  if (zipMatch) return zipMatch[1].trim()
  // Geen NL-zip: laatste komma-deel = city
  const parts = address.split(',')
  return parts[parts.length - 1].trim()
}

/**
 * Plaats AliExpress-order op klantadres. Fout-tolerant: klant heeft al betaald,
 * dus een placeorder-fout mag de webhook niet laten crashen — wel loggen + Telegram.
 */
async function placeOrderForShopOrder(orderId: string, order: any, addressMapRaw: string) {
  try {
    // Idempotentie: niet opnieuw plaatsen als koppeling al bestaat
    const links = await getAliexpressOrderLinks()
    if (links[orderId]) {
      console.log(`Placeorder overgeslagen (bestaat al): ${orderId} -> ${links[orderId].orderId}`)
      return
    }

    const addressMap = JSON.parse(addressMapRaw)
    const sources = await getProductSources()

    const items = []
    for (const item of order.items || []) {
      const source = sources[item.productId]
      if (!source?.productId || !source.skuAttr) {
        throw new Error(`Geen AliExpress-bron voor product ${item.productId}`)
      }
      const logisticsServiceName = await getFreightOption(
        source.productId,
        source.skuId,
        addressMap.countryCode,
        item.quantity
      )
      items.push({
        productId: source.productId,
        skuAttr: source.skuAttr,
        quantity: item.quantity,
        logisticsServiceName,
      })
    }

    const result = await placeOrder(
      addressMap,
      items,
      order.customer_name || 'Klant',
      extractCity(order.address),
      extractZip(order.address),
      extractStreet(order.address),
      orderId
    )

    await saveAliexpressOrderLink(orderId, {
      orderId: result.orderId,
      placedAt: new Date().toISOString(),
      status: 'placed',
    })
    await updateOrder(orderId, { status: 'shipped' })
    console.log(`Placeorder OK: ${orderId} -> AliExpress ${result.orderId}`)
    await sendTelegramNotification(
      `✅ AliExpress-order geplaatst\nWinkel: ${orderId}\nAliExpress: ${result.orderId}`
    )
  } catch (error: any) {
    console.error(`Placeorder mislukt voor ${orderId}:`, error)
    try {
      await saveAliexpressOrderLink(orderId, {
        orderId: '',
        placedAt: new Date().toISOString(),
        status: 'failed',
        error: error.message,
      })
    } catch {}
    await sendTelegramNotification(
      `❌ Placeorder mislukt voor ${orderId}\n${error.message}`
    )
  }
}
