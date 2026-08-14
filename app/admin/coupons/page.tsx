'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Coupon } from '@/lib/coupons'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [code, setCode] = useState('')
  const [discountPct, setDiscountPct] = useState(10)
  const [maxUses, setMaxUses] = useState(0)
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const res = await adminFetch('/api/coupons')
      setCoupons(await res.json())
    } catch (err) {
      console.error('Failed to fetch coupons:', err)
    }
  }

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await adminFetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discount_pct: discountPct,
          max_uses: maxUses,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Aanmaken mislukt')
        return
      }
      setCode('')
      setDiscountPct(10)
      setMaxUses(0)
      setExpiresAt('')
      setSuccess(`Coupon aangemaakt!`)
      loadCoupons()
    } catch (err) {
      setError('Aanmaken mislukt')
    }
  }

  const removeCoupon = async (c: Coupon) => {
    if (!confirm(`Coupon ${c.code} verwijderen?`)) return
    await adminFetch(`/api/coupons?code=${encodeURIComponent(c.code)}`, { method: 'DELETE' })
    loadCoupons()
  }

  const statusLabel = (c: Coupon) => {
    if (!c.active) return 'Uit'
    if (c.expires_at && new Date(c.expires_at) < new Date()) return 'Verlopen'
    if (c.max_uses > 0 && c.used_count >= c.max_uses) return 'Opgebruikt'
    return 'Actief'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Kortingscodes</h1>

      <form onSubmit={createCoupon} className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Nieuwe coupon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="bijv. WELKOM10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Korting (%)</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max. gebruik (0 = onbeperkt)</label>
            <input
              type="number"
              min={0}
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verloopt op (optioneel)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        {success && <p className="text-green-700 text-sm mt-3">{success}</p>}
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Aanmaken
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nog geen kortingscodes.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Korting</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gebruikt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verloopt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actie</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map(c => (
                <tr key={c.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.discount_pct}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {c.used_count}{c.max_uses > 0 ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('nl-NL') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      statusLabel(c) === 'Actief' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {statusLabel(c)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => removeCoupon(c)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
