'use client'

import { useCart } from '@/components/Cart'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeFromCart, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Er is iets misgegaan. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Winkelmand</h1>
        <p className="text-gray-600">Je winkelmand is leeg.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Winkelmand</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-gray-600">€{item.price.toFixed(2)} x {item.quantity}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-900">
                €{(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                Verwijder
              </button>
            </div>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-gray-900">Totaal:</span>
            <span className="text-2xl font-bold text-gray-900">€{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Laden...' : 'Betalen met Stripe'}
          </button>
        </div>
      </div>
    </div>
  )
}
