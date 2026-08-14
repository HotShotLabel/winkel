'use client'

import { Product } from '@/lib/orders'
import Link from 'next/link'
import { useCart } from '@/components/Cart'
import { useState } from 'react'

export default function ProductCard({ product, oldPrice }: { product: Product; oldPrice?: number | null }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const discountPct =
    oldPrice && oldPrice > product.price
      ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
      : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
    >
      <div className="aspect-square bg-gray-200 flex items-center justify-center relative">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">Geen afbeelding</span>
        )}
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-2xl font-bold text-gray-900">
              €{product.price.toFixed(2)}
            </span>
            {discountPct && (
              <span className="text-sm text-gray-400 line-through">
                €{oldPrice?.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`${added ? 'bg-green-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors whitespace-nowrap`}
          >
            {added ? '✓ Toegevoegd' : 'Toevoegen'}
          </button>
        </div>
      </div>
    </Link>
  )
}
