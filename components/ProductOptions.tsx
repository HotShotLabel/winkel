'use client'

import { useState } from 'react'
import { Product } from '@/lib/orders'
import { getProductOptions } from '@/lib/productOptions'
import { useCart } from '@/components/Cart'

export default function ProductOptions({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [selected, setSelected] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const options = getProductOptions(product.id)
  if (!options) return null

  const handleAdd = () => {
    if (!selected) return
    addToCart(product, 1, selected)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">Kies je model:</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
              selected === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleAdd}
        disabled={!selected}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
          added ? 'bg-green-600' : selected ? 'bg-blue-600 hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {!selected ? 'Selecteer eerst een model' : added ? '✓ Toegevoegd!' : 'In winkelwagen'}
      </button>
    </div>
  )
}
