'use client'

import { useState, useEffect } from 'react'

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (params.id && email) {
      fetch(`/api/orders/${params.id}?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.id, email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && params.id) {
      setLoading(true)
    }
  }

  if (order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Status</h1>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="space-y-4">
              <div>
                <span className="font-medium">Order ID:</span>
                <span className="ml-2 text-gray-600">{order.id}</span>
              </div>
              <div>
                <span className="font-medium">Naam:</span>
                <span className="ml-2 text-gray-600">{order.customer_name}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                  order.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-gray-800'
                }`}>
                  {order.status === 'paid' ? 'Betaald' :
                   order.status === 'shipped' ? 'Verzonden' : 'In behandeling'}
                </span>
              </div>
              {order.tracking_code && (
                <div>
                  <span className="font-medium">Trackingcode:</span>
                  <span className="ml-2 text-blue-600">{order.tracking_code}</span>
                </div>
              )}
              {order.status === 'shipped' && (
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <p className="text-blue-800">
                    Je pakket is onderweg! Gebruik de trackingcode om de levering te volgen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Status Opvragen</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                value={params.id}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="je@email.nl"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Laden...' : 'Bekijk order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
