'use client'

import { Product } from '@/lib/orders'
import { useCart } from '@/components/Cart'
import { useState } from 'react'

export default function AddToCartButton({ product, large = false }: { product: Product; large?: boolean }) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className={`${large ? 'space-y-4' : ''}`}>
      {large && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Aantal:</span>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-4 py-2 text-xl font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Minder"
            >
              −
            </button>
            <span className="px-4 text-base font-semibold text-gray-900 min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => Math.min(10, q + 1))}
              disabled={quantity >= 10}
              className="px-4 py-2 text-xl font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Meer"
            >
              +
            </button>
          </div>
        </div>
      )}
      <button
        onClick={handleAdd}
        className={`${large ? 'w-full text-lg py-4' : 'px-4 py-2'} ${
          added ? 'bg-green-600' : 'bg-blue-600'
        } text-white font-semibold rounded-lg hover:opacity-90 transition-colors`}
      >
        {added ? '✓ Toegevoegd' : `🛒 ${large && quantity > 1 ? `In winkelmand (${quantity})` : 'In winkelmand'}`}
      </button>
    </div>
  )
}
