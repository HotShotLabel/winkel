import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/orders'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

// Sitemap voor alle 5 domeinen: elke taal op zijn eigen domein.
const staticPaths = ['', '/garantie', '/privacy', '/voorwaarden']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
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
  }

  return entries
}
