import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export const metadata = {
  title: 'Garantie & Retour | Onze Winkel',
}

export default async function GarantiePage() {
  const t = await getTranslations('garantie')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('subtitle')}</p>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          {t('gTitle')}
        </h2>
        <p className="text-green-700">
          {t('gText')}
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('conditionsTitle')}</h2>
      <p className="text-gray-600 mb-4">
        {t('conditionsText')}
      </p>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mb-8">
        <li>{t.rich('c1', { strong: chunks => <strong>{chunks}</strong> })}</li>
        <li>{t.rich('c2', { strong: chunks => <strong>{chunks}</strong> })}</li>
        <li>{t.rich('c3', { strong: chunks => <strong>{chunks}</strong> })}</li>
        <li>{t.rich('c4', { strong: chunks => <strong>{chunks}</strong> })}</li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('howTitle')}</h2>
      <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-8">
        <li>{t('how1')}</li>
        <li>{t('how2')}</li>
        <li>{t('how3')}</li>
        <li>{t('how4')}</li>
      </ol>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('contactTitle')}</h2>
        <p className="text-gray-600 mb-1">
          {t('contactText')}
        </p>
        <p className="text-gray-700">
          📧 <a href="mailto:mijnwinkel.vercel@proton.me" className="text-blue-600 hover:underline">mijnwinkel.vercel@proton.me</a>
        </p>
      </div>

      <Link href="/" className="text-blue-600 hover:underline">
        {t('back')}
      </Link>
    </div>
  )
}