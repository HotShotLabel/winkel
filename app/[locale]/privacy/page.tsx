import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'privacy' })
  return { title: t('title') }
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy')
  const sections = t.raw('sections') as { h: string; p: string }[]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('updated')}</p>
      <p className="text-gray-700 mb-8 leading-relaxed">{t('intro')}</p>
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{s.h}</h2>
            <p className="text-gray-700 leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  )
}