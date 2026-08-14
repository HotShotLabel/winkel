import { getProduct } from '@/lib/orders'
import { getProductPrices } from '@/lib/prices'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) {
    notFound()
  }

  const prices = await getProductPrices()
  const oldPrice = prices[product.id]?.old_price
  const discountPct =
    oldPrice && oldPrice > product.price
      ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
      : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← Terug naar alle producten
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Afbeelding */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          ) : (
            <div className="aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
              Geen afbeelding
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            {oldPrice && oldPrice > product.price ? (
              <>
                <span className="text-3xl font-bold text-gray-900">
                  €{product.price.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  €{oldPrice.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded-lg">
                  {discountPct}% korting
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <AddToCartButton product={product} large />

          {/* Garantie-blok */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="font-semibold text-green-800 mb-2">✓ 100% tevredenheidsgarantie</h2>
            <ul className="text-sm text-green-700 space-y-1">
              <li>Niet goed? Geld terug binnen 7 dagen</li>
              <li>Pakket ongeopend en product onbeschadigd</li>
              <li>Veilig betalen via Stripe</li>
            </ul>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-1"><span className="font-medium text-gray-700">Verzending:</span> 2-3 weken</p>
            <p>
              <Link href="/garantie" className="text-blue-600 hover:underline">
                Bekijk onze garantievoorwaarden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
