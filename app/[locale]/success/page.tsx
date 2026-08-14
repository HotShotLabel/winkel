'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

function SuccessContent() {
  const t = useTranslations('success')
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('thanks')}</h1>
        <p className="text-xl text-gray-600">{t('loading')}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('orderNotFound')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('checkEmail')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('thanks')}</h1>
          <p className="text-xl text-gray-600">{t('received')}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">{t('confirmation')}</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium">{t('orderId')}</span>
              <span className="ml-2 text-gray-600">{order.id}</span>
            </div>
            <div>
              <span className="font-medium">{t('name')}</span>
              <span className="ml-2 text-gray-600">{order.customer_name}</span>
            </div>
            <div>
              <span className="font-medium">{t('email')}</span>
              <span className="ml-2 text-gray-600">{order.customer_email}</span>
            </div>
            <div>
              <span className="font-medium">{t('address')}</span>
              <span className="ml-2 text-gray-600">{order.address}</span>
            </div>
            <div>
              <span className="font-medium">{t('total')}</span>
              <span className="ml-2 text-gray-600">€{order.total.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">{t('status')}</span>
              <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-gray-800'
              }`}>
                {order.status === 'paid' ? t('paid') :
                 order.status === 'shipped' ? t('shipped') : t('processing')}
              </span>
            </div>
            {order.tracking_code && (
              <div>
                <span className="font-medium">{t('trackingCode')}</span>
                <span className="ml-2 text-blue-600">{order.tracking_code}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t('savePage')}</h3>
          <p className="text-blue-800 text-sm">
            {t('savePageText')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  const t = useTranslations('success')
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('thanks')}</h1>
        <p className="text-xl text-gray-600">{t('loading')}</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}