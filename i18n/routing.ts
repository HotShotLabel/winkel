import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['nl', 'en', 'fr', 'de', 'es'],
  defaultLocale: 'nl',
})

export type Locale = (typeof routing.locales)[number]