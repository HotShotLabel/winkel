'use client'

import { useCart } from '@/components/Cart'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'

export default function CartPage() {
  const t = useTranslations('cart')
  const { items, removeFromCart, updateQuantity, total } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>
        <p className="text-gray-600">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {items.map(item => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-gray-200 last:border-0">
            <div className="flex-1 min-w-[150px]">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-gray-600">€{item.price.toFixed(2)} {t('perPiece')}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Aantal-stepper */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1.5 text-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Minder"
                >
                  −
                </button>
                <span className="px-3 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 10}
                  className="px-3 py-1.5 text-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Meer"
                >
                  +
                </button>
              </div>
              <span className="text-lg font-semibold text-gray-900 min-w-[5rem] text-right">
                €{(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                {t('remove')}
              </button>
            </div>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-gray-900">{t('total')}</span>
            <span className="text-2xl font-bold text-gray-900">€{total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('checkout')}
          </button>
        </div>
      </div>
    </div>
  )
}