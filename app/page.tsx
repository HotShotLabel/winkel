import { getProducts } from '@/lib/orders'
import { getProductPrices } from '@/lib/prices'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const products = await getProducts()
  const prices = await getProductPrices()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welkom bij Onze Winkel
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Slimme gadgets en handige producten, snel en eenvoudig besteld
          </p>
          <Link
            href="#producten"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Bekijk producten
          </Link>
        </div>
      </section>

      {/* Trust-badges */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl mb-1">🛡️</div>
            <p className="font-semibold text-gray-900">100% tevredenheidsgarantie</p>
            <p className="text-sm text-gray-500">Niet goed? Geld terug binnen 7 dagen</p>
          </div>
          <div>
            <div className="text-2xl mb-1">📦</div>
            <p className="font-semibold text-gray-900">Snel en veilig verzonden</p>
            <p className="text-sm text-gray-500">Zorgvuldig verpakt en track & trace</p>
          </div>
          <div>
            <div className="text-2xl mb-1">💳</div>
            <p className="font-semibold text-gray-900">Veilig betalen</p>
            <p className="text-sm text-gray-500">Betaling via Stripe, 100% beveiligd</p>
          </div>
        </div>
      </section>

      {/* Producten */}
      <div id="producten" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Onze producten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              oldPrice={prices[product.id]?.old_price}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
