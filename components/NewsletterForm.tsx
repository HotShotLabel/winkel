'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function NewsletterForm() {
  const t = useTranslations('newsletter')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok' | 'error' | 'invalid'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('invalid')
      setTimeout(() => setStatus('idle'), 4000)
      return
    }
    setStatus('submitting')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      if (!res.ok) throw new Error('failed')
      setEmail('')
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('title')}</h3>
      <p className="text-sm text-gray-600 mb-3">{t('sub')}</p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-xs">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {t('button')}
        </button>
      </form>
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
        </label>
      </div>
      {status === 'ok' && <p className="mt-2 text-sm font-medium text-green-700">{t('ok')}</p>}
      {status === 'invalid' && <p className="mt-2 text-sm font-medium text-red-600">{t('invalid')}</p>}
      {status === 'error' && <p className="mt-2 text-sm font-medium text-red-600">{t('error')}</p>}
    </div>
  )
}
