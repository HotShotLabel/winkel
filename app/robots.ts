import type { MetadataRoute } from 'next'

// Dezelfde deployment draait op alle 5 domeinen; de sitemap bevat alle domeinen.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout', '/success', '/account', '/order'],
    },
    sitemap: 'https://mijnwinkel.vercel.app/sitemap.xml',
  }
}
