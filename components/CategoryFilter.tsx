'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Product } from '@/lib/orders'
import { ProductPrices } from '@/lib/prices'
import { CATEGORIES, productCategory, CategoryId } from '@/lib/categories'
import ProductCard from '@/components/ProductCard'

interface Props {
  products: Product[]
  soldCounts: Record<string, number>
  oldPrices: ProductPrices
}

export default function CategoryFilter({ products, soldCounts, oldPrices }: Props) {
  const t = useTranslations('categories')
  const [active, setActive] = useState<CategoryId | null>(null)

  const sorted = [...products].sort(
    (a, b) => (a.number ?? 99) - (b.number ?? 99),
  )
  const filtered = active
    ? sorted.filter(p => productCategory(p.id) === active)
    : sorted

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === null
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
          }`}
        >
          {t('all')}
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(active === cat.id ? null : cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
          >
            {cat.emoji} {t(cat.id)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              oldPrice={oldPrices[product.id]?.old_price}
              sold={soldCounts[product.id] || 0}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">{t('empty')}</p>
      )}
    </div>
  )
}