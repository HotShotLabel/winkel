'use client'

import { useState } from 'react'
import { Product } from '@/lib/orders'
import { getProductOptions } from '@/lib/productOptions'
import { useCart } from '@/components/Cart'
import { useTranslations } from 'next-intl'

export default function ProductOptions({ product, large }: { product: Product; large?: boolean }) {
  const t = useTranslations('product')
  const { addToCart } = useCart()
  const [selected, setSelected] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const options = getProductOptions(product.id)

  if (!options) return null // niet-iphone product

  const handleAdd = () => {
    if (!selected) return
    addToCart(product, quantity, selected)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">{t('chooseModel')}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              selected === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {large && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">{t('quantity')}</span>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="px-4 py-2 text-xl font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40">−</button>
            <span className="px-4 text-base font-semibold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(10, q + 1))} disabled={quantity >= 10} className="px-4 py-2 text-xl font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40">+</button>
          </div>
        </div>
      )}
      <button
        onClick={handleAdd}
        disabled={!selected}
        className={`${large ? 'w-full text-lg py-4' : 'px-4 py-2'} ${
          added ? 'bg-green-600' : selected ? 'bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
        } text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-60`}
      >
        {!selected ? t('selectModelFirst') : added ? t('added') : t('addToCart')}
      </button>
    </div>
  )
}
