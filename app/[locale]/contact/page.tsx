'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', company: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      // Als de bezoeker is ingelogd, wordt het een platform-bericht (gesprek in account)
      let token = ''
      try {
        const stored = JSON.parse(localStorage.getItem('mijnwinkel_session') || 'null')
        token = stored?.token || ''
      } catch {
        // ignore
      }
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('fout')
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '', company: '' })
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('subtitle')}</p>

      {status === 'sent' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-800">
          <p className="font-semibold mb-1">{t('sentTitle')}</p>
          <p className="text-sm">{t('sentText')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Honeypot — onzichtbaar voor mensen */}
          <div className="hidden" aria-hidden="true">
            <label>Company</label>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {status === 'error' && (
            <p className="text-red-600 text-sm">{t('error')}</p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {status === 'sending' ? t('sending') : t('send')}
          </button>
        </form>
      )}
    </div>
  )
}
