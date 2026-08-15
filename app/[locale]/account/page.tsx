'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import AccountMessages from '@/components/AccountMessages'

const SESSION_KEY = 'mijnwinkel_session'

function AccountContent() {
  const t = useTranslations('account')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Sessie herstellen uit localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.email && parsed?.token) {
          setSessionEmail(parsed.email)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Magic link token verwerken
  useEffect(() => {
    if (token) {
      setLoading(true)
      fetch(`/api/account/verify?token=${encodeURIComponent(token)}`)
        .then(res => res.json())
        .then(data => {
          if (data.sessionToken && data.email) {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ email: data.email, token: data.sessionToken }))
            setSessionEmail(data.email)
            // Token uit URL halen
            window.history.replaceState({}, '', `/${locale}/account`)
          } else {
            setError(data.error || t('linkExpired'))
          }
        })
        .catch(() => setError(t('errGeneric')))
        .finally(() => setLoading(false))
    }
  }, [token, locale, t])

  // Orders laden bij sessie
  useEffect(() => {
    if (!sessionEmail) return
    setLoading(true)
    let stored: any = null
    try {
      stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      // ignore
    }
    fetch('/api/account/orders', {
      headers: { Authorization: `Bearer ${stored?.token || ''}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          setOrders(data.orders)
        } else {
          setError(data.error || t('sessionExpired'))
          setSessionEmail(null)
          localStorage.removeItem(SESSION_KEY)
        }
      })
      .catch(() => setError(t('errGeneric')))
      .finally(() => setLoading(false))
  }, [sessionEmail, t])

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/account/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || t('errGeneric'))
      }
    } catch {
      setError(t('errGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    setSessionEmail(null)
    setOrders(null)
    setSent(false)
  }

  // Niet ingelogd
  if (!sessionEmail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600 mb-8">{t('loginText')}</p>

          {sent ? (
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-green-900 mb-2">{t('sentTitle')}</h2>
              <p className="text-green-800">
                {t.rich('sentText', { email, strong: chunks => <strong>{chunks}</strong> })}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendLink} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? t('loading') : t('sendLink')}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Ingelogd
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{sessionEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          {t('logout')}
        </button>
      </div>

      {loading && orders === null ? (
        <p className="text-gray-600">{t('loading')}</p>
      ) : orders && orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('noOrders')}</h2>
          <p className="text-gray-600 mb-6">{t('noOrdersText')}</p>
          <a href={`/${locale}`} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            {t('goToShop')}
          </a>
        </div>
      ) : orders ? (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{order.id}</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString(locale)}
                  </p>
                </div>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  order.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-gray-800'
                }`}>
                  {order.status === 'paid' ? t('paid') :
                   order.status === 'shipped' ? t('shipped') : t('processing')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                    <span className="text-gray-900 font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                  <span>{t('total')}</span>
                  <span>€{order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.tracking_code && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <span className="font-medium text-blue-900">{t('trackingCode')}</span>
                  <span className="text-blue-700 font-mono">{order.tracking_code}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <AccountMessages locale={locale} />
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-gray-600">...</div>}>
      <AccountContent />
    </Suspense>
  )
}