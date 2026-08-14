import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-gray-700 leading-relaxed">{t('p1')}</p>
        <p className="text-gray-700 leading-relaxed">{t('p2')}</p>
        <p className="text-gray-700 leading-relaxed">{t('p3')}</p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3">{t('promiseTitle')}</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ {t('promise1')}</li>
            <li>✅ {t('promise2')}</li>
            <li>✅ {t('promise3')}</li>
            <li>✅ {t('promise4')}</li>
          </ul>
        </div>

        <p className="text-gray-700 leading-relaxed">{t('p4')}</p>
      </div>
    </div>
  )
}
