'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/lib/orders'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'all' | 'paid' | 'shipped' | 'pending'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingCode, setTrackingCode] = useState('')

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch orders:', err))
  }, [])

  const updateTracking = async () => {
    if (!selectedOrder || !trackingCode.trim()) return

    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: selectedOrder.id, trackingCode: trackingCode.trim() }),
    })

    setOrders(orders.map(o => 
      o.id === selectedOrder.id 
        ? { ...o, trackingCode: trackingCode.trim(), status: 'shipped' as const }
        : o
    ))
    setTrackingCode('')
    setSelectedOrder(null)
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bestellingen</h1>
        <div className="flex space-x-2">
          {['all', 'paid', 'shipped', 'pending'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'Alle' : status === 'paid' ? 'Betaald' : status === 'shipped' ? 'Verzonden' : 'Open'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nog geen bestellingen.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Totaal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actie</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.id.slice(0, 12)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{order.customerName || 'Onbekend'}</div>
                    <div className="text-gray-500">{order.customerEmail || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                      order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'shipped' ? 'Verzonden' :
                       order.status === 'paid' ? 'Betaald' : 'In behandeling'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.trackingCode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setTrackingCode(order.trackingCode || '')
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.trackingCode ? 'Wijzig tracking' : 'Voeg tracking toe'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tracking Code Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Tracking code toevoegen</h3>
            <p className="text-sm text-gray-600 mb-4">
              Order: {selectedOrder.id.slice(0, 12)}...
            </p>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="bijv. ABC123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={updateTracking}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Opslaan
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setTrackingCode('')
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
