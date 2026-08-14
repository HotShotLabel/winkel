'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/orders'
import { Link } from '@/i18n/navigation'
import { useWishlist } from '@/components/Wishlist'
import { useCart } from '@/components/Cart'
import { useTranslations } from 'next-intl'

export default function WishlistPage() {
  const t = useTranslations('wishlist')
  const { ids, toggle } = useWishlist()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      return
    }
    fetch('/api/products')
      .then(res => res.json())
      .then((all: Product[]) => setProducts(all.filter(p => ids.includes(p.id))))
      .catch(err => console.error('Failed to fetch wishlist products:', err))
  }, [ids])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-6">{t('empty')}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {t('backToShop')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">€{product.price.toFixed(2)}</p>
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  {t('addToCart')}
                </button>
                <button
                  onClick={() => toggle(product.id)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
