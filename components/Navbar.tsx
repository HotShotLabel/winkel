'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useAdmin } from '@/components/AdminContext'
import { useCart } from '@/components/Cart'
import { usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import Logo from '@/components/Logo'

const LANGUAGE_NAMES: Record<string, string> = {
  nl: '🇳🇱 Nederlands',
  en: '🇬🇧 English',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
  es: '🇪🇸 Español',
}

export default function Navbar() {
  const t = useTranslations('nav')
  const { isAuthenticated } = useAdmin()
  const { itemCount } = useCart()
  const pathname = usePathname() // pad ZONDER locale-prefix (next-intl gedrag)
  const locale = useLocale()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-base sm:text-xl font-bold text-gray-900">
                {t('shopName')}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-base">
            <Link href="/" className="hidden sm:inline text-gray-900 hover:text-gray-600">
              {t('products')}
            </Link>
            <Link href="/cart" className="text-gray-900 hover:text-gray-600 flex items-center gap-1.5 sm:gap-2">
              <span>{t('cart')}</span>
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="cart-badge inline-flex items-center justify-center min-w-[1.5rem] h-5 sm:h-6 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold"
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="text-gray-900 hover:text-gray-600">
              <span className="hidden sm:inline">{t('account')} </span>
              <span className="sm:hidden">{t('accountShort')}</span>
            </Link>
            {isAuthenticated && (
              <Link href="/admin" className="text-gray-500 hover:text-gray-900 text-xs">
                {t('admin')}
              </Link>
            )}
            {/* Taalwisselaar */}
            <select
              aria-label={t('language')}
              value={locale}
              onChange={e => {
                const newLocale = e.target.value
                const rest = pathname.slice(1)
                window.location.href = `/${newLocale}${rest ? '/' + rest : ''}`
              }}
              className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer"
            >
              {routing.locales.map(locale => (
                <option key={locale} value={locale}>
                  {LANGUAGE_NAMES[locale]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}