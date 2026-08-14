import { getProducts, localizeProduct } from '@/lib/orders'
import { getProductPrices } from '@/lib/prices'
import { getProductSeasons } from '@/lib/seasons'
import { getTranslations, getLocale } from 'next-intl/server'
import ProductCard from '@/components/ProductCard'
import { Link } from '@/i18n/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const t = await getTranslations('home')
  const locale = await getLocale()
  const products = (await getProducts()).map(p => localizeProduct(p, locale))
  const prices = await getProductPrices()
  const seasons = await getProductSeasons()

  const zomerProducts = products.filter(p => seasons[p.id] === 'zomer')
  const winterProducts = products.filter(p => seasons[p.id] === 'winter')
  const overigeProducts = products.filter(p => !seasons[p.id])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#zomer"
              className="inline-block bg-amber-400 text-amber-950 font-semibold px-8 py-3 rounded-lg hover:bg-amber-300 transition-colors"
            >
              {t('summerBtn')}
            </Link>
            <Link
              href="#winter"
              className="inline-block bg-sky-200 text-sky-950 font-semibold px-8 py-3 rounded-lg hover:bg-sky-100 transition-colors"
            >
              {t('winterBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust-badges */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl mb-1">🛡️</div>
            <p className="font-semibold text-gray-900">{t('trust1Title')}</p>
            <p className="text-sm text-gray-500">{t('trust1Sub')}</p>
          </div>
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <p className="font-semibold text-gray-900">{t('trust2Title')}</p>
            <p className="text-sm text-gray-500">{t('trust2Sub')}</p>
          </div>
          <div>
            <div className="text-2xl mb-1">💳</div>
            <p className="font-semibold text-gray-900">{t('trust3Title')}</p>
            <p className="text-sm text-gray-500">{t('trust3Sub')}</p>
          </div>
        </div>
      </section>

      {/* Zomer */}
      <section id="zomer" className="bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">☀️</div>
            <h2 className="text-3xl font-bold text-amber-950">{t('summerTitle')}</h2>
            <p className="text-amber-900 mt-2">{t('summerSub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {zomerProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                oldPrice={prices[product.id]?.old_price}
              />
            ))}
          </div>
          {zomerProducts.length === 0 && (
            <p className="text-center text-amber-900 py-8">{t('emptySummer')}</p>
          )}
        </div>
      </section>

      {/* Winter */}
      <section id="winter" className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">❄️</div>
            <h2 className="text-3xl font-bold text-white">{t('winterTitle')}</h2>
            <p className="text-sky-200 mt-2">{t('winterSub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {winterProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                oldPrice={prices[product.id]?.old_price}
              />
            ))}
          </div>
          {winterProducts.length === 0 && (
            <p className="text-center text-sky-200 py-8">{t('emptyWinter')}</p>
          )}
        </div>
      </section>

      {/* Overige producten */}
      <div id="producten" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('otherTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {overigeProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              oldPrice={prices[product.id]?.old_price}
            />
          ))}
        </div>
        {overigeProducts.length === 0 && (
          <p className="text-gray-500">{t('emptyOther')}</p>
        )}
      </div>
    </div>
  )
}