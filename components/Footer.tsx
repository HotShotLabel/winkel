import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function Footer() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">{t('shopName')}</h3>
            <p className="text-sm text-gray-400">
              {t('tagline')}
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('service')}</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/garantie" className="hover:text-white">
                  {t('guarantee')}
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  {t('myAccount')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">{t('promise')}</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>{t('p1')}</li>
              <li>{t('p2')}</li>
              <li>{t('p3')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          {t('copyright', { year })}
        </div>
      </div>
    </footer>
  )
}