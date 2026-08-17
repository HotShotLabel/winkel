import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { absoluteUrl, languageAlternates } from '@/lib/seo'
import Navbar from '@/components/Navbar'
import AnnouncementBar from '@/components/AnnouncementBar'
import Footer from '@/components/Footer'
import HtmlLangSetter from '@/components/HtmlLangSetter'
import CookieBanner from '@/components/CookieBanner'
import ChatWidget from '@/components/ChatWidget'
import { CartProvider } from '@/components/Cart'
import { WishlistProvider } from '@/components/Wishlist'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

// Per-taal metadata + hreflang-koppeling naar alle taal-domeinen.
export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const description = t('description')
  return {
    title: t('title'),
    description,
    alternates: {
      canonical: absoluteUrl(locale),
      languages: languageAlternates(locale),
    },
    openGraph: {
      title: t('title'),
      description,
      siteName: 'Alles In 1 Winkel',
      type: 'website',
      locale: locale === 'nl' ? 'nl_NL' : locale,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <NextIntlClientProvider>
      <HtmlLangSetter />
      <CartProvider>
        <WishlistProvider>
          <AnnouncementBar locale={locale} />
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <ChatWidget />
        </WishlistProvider>
      </CartProvider>
    </NextIntlClientProvider>
  )
}