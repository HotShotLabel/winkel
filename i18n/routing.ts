import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['nl', 'en', 'fr', 'de', 'es'],
  defaultLocale: 'nl',
  localePrefix: 'always',
  domains: [
    { domain: '1place4all.vercel.app', defaultLocale: 'nl', locales: ['nl', 'en', 'fr', 'de', 'es'] },
    { domain: 'myshopstore.vercel.app', defaultLocale: 'en', locales: ['nl', 'en', 'fr', 'de', 'es'] },
    { domain: 'maboutique-two.vercel.app', defaultLocale: 'fr', locales: ['nl', 'en', 'fr', 'de', 'es'] },
    { domain: 'meinshop.vercel.app', defaultLocale: 'de', locales: ['nl', 'en', 'fr', 'de', 'es'] },
    { domain: 'mitienda-peach.vercel.app', defaultLocale: 'es', locales: ['nl', 'en', 'fr', 'de', 'es'] },
  ],
})

export type Locale = (typeof routing.locales)[number]