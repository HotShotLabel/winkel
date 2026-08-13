'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bedankt voor je bestelling!</h1>
        <p className="text-xl text-gray-600">Laden...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order niet gevonden</h1>
        <p className="text-xl text-gray-600 mb-8">Controleer je email voor de order link.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bedankt voor je bestelling!</h1>
          <p className="text-xl text-gray-600">We hebben je bestelling ontvangen.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Orderbevestiging</h2>
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
              <span className="font-medium">Email:</span>
              <span className="ml-2 text-gray-600">{order.customer_email}</span>
            </div>
            <div>
              <span className="font-medium">Adres:</span>
              <span className="ml-2 text-gray-600">{order.address}</span>
            </div>
            <div>
              <span className="font-medium">Totaal:</span>
              <span className="ml-2 text-gray-600">€{order.total.toFixed(2)}</span>
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
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Bewaar deze pagina</h3>
          <p className="text-blue-800 text-sm">
            Je kunt deze pagina opnieuw bezoeken met je order ID en email om de status te bekijken.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bedankt voor je bestelling!</h1>
        <p className="text-xl text-gray-600">Laden...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
