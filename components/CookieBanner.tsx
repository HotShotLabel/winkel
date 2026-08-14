'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const CONSENT_KEY = 'cookie-consent'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

function loadGtag() {
  if (!GA_ID || document.querySelector('#gtag-script')) return
  const s = document.createElement('script')
  s.id = 'gtag-script'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  const inline = document.createElement('script')
  inline.id = 'gtag-inline'
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `
  document.head.appendChild(inline)
}

export default function CookieBanner() {
  const t = useTranslations('cookie')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Geen GA geconfigureerd → banner overbodig
    if (!GA_ID) return
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
    } catch {}
  }, [])

  const decide = (accepted: boolean) => {
    try {
      localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'declined')
    } catch {}
    setVisible(false)
    if (accepted) loadGtag()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-gray-900 text-white p-4 sm:p-5 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          {t('text')}{' '}
          <a href="/privacy" className="underline hover:text-white">
            {t('privacy')}
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => decide(false)}
            className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {t('decline')}
          </button>
          <button
            onClick={() => decide(true)}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
