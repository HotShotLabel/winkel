import { getTranslations } from 'next-intl/server'

export default async function AnnouncementBar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'announcement' })
  return (
    <div className="bg-blue-800 text-white text-center text-sm font-medium py-2 px-4">
      {t('text')}
    </div>
  )
}