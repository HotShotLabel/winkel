// SEO-hulpmiddelen: absolute URLs per taal-domein en hreflang-alternates.
// Elke taal heeft een eigen domein (zie i18n/routing.ts), Google moet die koppeling weten.

import { routing } from '@/i18n/routing'

export function domainForLocale(locale: string): string {
  const entry = routing.domains?.find(d => d.defaultLocale === locale)
  return entry?.domain || '1place4all.vercel.app'
}

// Pad is relatief aan de taal, bv. '/product/koelhalsband' of '' (homepage).
export function absoluteUrl(locale: string, path = ''): string {
  const clean = path && !path.startsWith('/') ? `/${path}` : path
  return `https://${domainForLocale(locale)}/${locale}${clean}`
}

// hreflang-map: dezelfde pagina op elk taal-domein + x-default.
export function languageAlternates(
  locale: string,
  path = ''
): Record<string, string> {
  const alt: Record<string, string> = {
    'x-default': absoluteUrl(routing.defaultLocale, path),
  }
  for (const l of routing.locales) {
    alt[l] = absoluteUrl(l, path)
  }
  return alt
}
