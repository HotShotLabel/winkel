'use client'

import { useState } from 'react'
import { useCart } from '@/components/Cart'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/navigation'
import { COUNTRIES } from '@/lib/address-map'

interface CouponState {
  code: string
  status: 'idle' | 'checking' | 'valid' | 'invalid'
  discountPct?: number
  discountAmount?: number
  error?: string
}

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [coupon, setCoupon] = useState<CouponState>({ code: '', status: 'idle' })
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: 'Nederland',
    province: '',
    phone: '',
    email: '',
  })

  const country = COUNTRIES.find((c) => c.name === formData.country)

  const discount = coupon.status === 'valid' ? coupon.discountAmount || 0 : 0
  const payable = Math.max(0, total - discount)

  const applyCoupon = async () => {
    const code = coupon.code.trim()
    if (!code || coupon.status === 'checking') return
    setCoupon({ ...coupon, status: 'checking' })
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: total }),
      })
      const result = await res.json()
      if (result.valid && result.discountAmount > 0) {
        setCoupon({
          ...coupon,
          status: 'valid',
          discountPct: result.discountPct,
          discountAmount: result.discountAmount,
        })
      } else {
        setCoupon({ ...coupon, status: 'invalid', discountPct: undefined, discountAmount: undefined })
      }
    } catch (error) {
      setCoupon({ ...coupon, status: 'invalid', discountPct: undefined, discountAmount: undefined })
    }
  }

  const removeCoupon = () => {
    setCoupon({ code: '', status: 'idle', discountPct: undefined, discountAmount: undefined })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setTermsError(true)
      return
    }
    setTermsError(false)
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: formData,
          couponCode: coupon.status === 'valid' ? coupon.code : '',
        }),
      })

      const { url, orderId } = await response.json()
      if (url) {
        clearCart()
        router.push(url)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(t('errGeneric'))
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-gray-600 mb-8">{t('empty')}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {t('backToShop')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulier */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">{t('details')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')}</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')}</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
              <input
                type="tel"
                required
                placeholder={country ? `${country.phoneCountry} 612345678` : '0612345678'}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('houseNumber')}</label>
                <input
                  type="text"
                  required
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('postalCode')}</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('country')}</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, province: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code}>{c.name}</option>
                  ))}
                  <option>{t('other')}</option>
                </select>
              </div>
            </div>
            {country && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('province')}</label>
                <select
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('chooseProvince')}</option>
                  {country.regions.map((r) => (
                    <option key={r.code} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Akkoord voorwaarden */}
            <div>
              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked)
                    setTermsError(false)
                  }}
                  className="mt-0.5 h-4 w-4"
                />
                <span>{t.rich('terms', { link: chunks => <Link href="/voorwaarden" className="underline">{chunks}</Link> })}</span>
              </label>
              {termsError && (
                <p className="text-red-600 text-sm mt-1">{t('termsError')}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? t('loading') : t('pay', { total: payable.toFixed(2) })}
            </button>
          </form>
        </div>

        {/* Overzicht */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">{t('overview')}</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">{t('quantity')} {item.quantity}</p>
                </div>
                <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            {/* Kortingscode */}
            <div className="pt-3">
              {coupon.status !== 'valid' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon.code}
                    onChange={(e) => setCoupon({ code: e.target.value.toUpperCase(), status: 'idle' })}
                    placeholder={t('couponPlaceholder')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={coupon.status === 'checking'}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
                  >
                    {coupon.status === 'checking' ? t('couponChecking') : t('couponApply')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="text-sm text-green-800">
                    <span className="font-semibold">{coupon.code}</span>
                    <span> — {t('couponDiscount', { pct: coupon.discountPct! })}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-green-700 text-xs underline hover:text-green-900"
                  >
                    {t('couponRemove')}
                  </button>
                </div>
              )}
              {coupon.status === 'invalid' && (
                <p className="text-red-600 text-sm mt-1">{t('couponInvalid')}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('subtotal')}</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>{t('discount')} ({coupon.code})</span>
                  <span>-€{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-2">
                <span>{t('total')}</span>
                <span>€{payable.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}