import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getProducts } from '@/lib/orders'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

// Host-aware sitemap: elk domein genereert alleen zijn eigen URLs.
// (Google accepteert in een property alleen URLs van het eigen domein.)
const staticPaths = ['', '/garantie', '/privacy', '/voorwaarden']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get('host') || 'mijnwinkel.vercel.app'
  const domainEntry = routing.domains?.find(d => d.domain === host)
  const locale = domainEntry?.defaultLocale || routing.defaultLocale

  const products = await getProducts()
  const entries: MetadataRoute.Sitemap = []

  for (const path of staticPaths) {
    entries.push({
      url: absoluteUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: path === '' ? 1 : 0.6,
    })
  }
  for (const product of products) {
    entries.push({
      url: absoluteUrl(locale, `/product/${product.id}`),
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return entries
}