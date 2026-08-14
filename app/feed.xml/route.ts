import { headers } from 'next/headers'
import { getProducts } from '@/lib/orders'
import { getProductPrices } from '@/lib/prices'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'
import { localizeProduct } from '@/lib/orders'

export const dynamic = 'force-dynamic'

// Google Shopping feed (product feed, RFC 7159-niet — XML zoals Google verwacht).
// Host-aware: elk domein exporteert zijn eigen taal + domein-URLs.
// Aanmelden in Merchant Center: https://<domein>/feed.xml
export async function GET() {
  const host = (await headers()).get('host') || 'mijnwinkel.vercel.app'
  const domainEntry = routing.domains?.find(d => d.domain === host)
  const locale = domainEntry?.defaultLocale || routing.defaultLocale

  const [products, prices] = await Promise.all([getProducts(), getProductPrices()])

  const xmlItems = products.map(product => {
    const localized = localizeProduct(product, locale)
    const oldPrice = prices[product.id]?.old_price
    const hasDiscount = oldPrice && oldPrice > product.price
    const link = absoluteUrl(locale, `/product/${product.id}`)

    const escape = (s: string) =>
      (s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    return `
  <item>
    <g:id>${escape(product.id)}</g:id>
    <title>${escape(localized.name)}</title>
    <description>${escape(localized.description)}</description>
    <link>${link}</link>
    ${product.image ? `<g:image_link>${escape(product.image)}</g:image_link>` : ''}
    <g:availability>in_stock</g:availability>
    <g:price>${product.price.toFixed(2)} EUR</g:price>
    ${hasDiscount ? `<g:sale_price>${product.price.toFixed(2)} EUR</g:sale_price><g:price>${oldPrice!.toFixed(2)} EUR</g:price>` : ''}
    <g:condition>new</g:condition>
    <g:brand>Mijn Winkel</g:brand>
    <g:google_product_category>Health &amp; Beauty</g:google_product_category>
  </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Mijn Winkel</title>
    <link>${absoluteUrl(locale)}</link>
    <description>Producten van Mijn Winkel</description>${xmlItems}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
