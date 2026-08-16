import { getProducts, localizeProduct, getPaidOrderCounts } from '@/lib/orders'
import { getProductPrices } from '@/lib/prices'
import { getProductSeasons } from '@/lib/seasons'
import { getRecentReviews, getReviewSummary } from '@/lib/reviews'
import HomeReviews from '@/components/HomeReviews'
import CategoryFilter from '@/components/CategoryFilter'
import { getTranslations, getLocale } from 'next-intl/server'
import { absoluteUrl } from '@/lib/seo'
import ProductCard from '@/components/ProductCard'
import { Link } from '@/i18n/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const t = await getTranslations('home')
  const faq = await getTranslations('faq')
  const locale = await getLocale()
  const products = (await getProducts()).map(p => localizeProduct(p, locale))
  const prices = await getProductPrices()
  const seasons = await getProductSeasons()

  const zomerProducts = products.filter(p => seasons[p.id] === 'zomer')
  const winterProducts = products.filter(p => seasons[p.id] === 'winter')

  const soldCounts = await getPaidOrderCounts()
  const soldFor = (id: string) => soldCounts[id] || 0

  // Bestsellers: meest verkochte eerst, daarna op productnummer.
  const bestsellers = [...products]
    .sort((a, b) => soldFor(b.id) - soldFor(a.id) || (a.number ?? 99) - (b.number ?? 99))
    .slice(0, 6)

  const [reviewSummary, recentReviews] = await Promise.all([
    getReviewSummary(),
    getRecentReviews(3),
  ])

  const faqItems = faq.raw('items') as { q: string; a: string }[]

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mijn Winkel',
    url: absoluteUrl(locale),
    email: 'mijnwinkel.vercel@proton.me',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-700 via-blue-600 to-blue-100 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#bestsellers"
              className="inline-block bg-amber-400 text-amber-950 font-semibold px-8 py-3 rounded-lg hover:bg-amber-300 transition-colors"
            >
              {t('heroBtn')}
            </Link>
          </div>
          {reviewSummary.count > 0 && (
            <p className="mt-6 text-sm text-blue-100">
              ⭐ {t('heroProof', { avg: reviewSummary.avg.toFixed(1), count: reviewSummary.count })}
            </p>
          )}
        </div>
      </section>

      {/* Trust-badges */}
      <section className="bg-gradient-to-b from-blue-100 to-white">
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

      {/* Bestsellers */}
      <section id="bestsellers" className="bg-gradient-to-b from-white to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">🔥</div>
            <h2 className="text-3xl font-bold text-gray-900">{t('bestsellersTitle')}</h2>
            <p className="text-gray-500 mt-2">{t('bestsellersSub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                oldPrice={prices[product.id]?.old_price}
                sold={soldFor(product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Alle producten met categorie-filter */}
      <div id="producten" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('allTitle')}</h2>
        <CategoryFilter products={products} soldCounts={soldCounts} oldPrices={prices} />
      </div>

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
                sold={soldFor(product.id)}
              />
            ))}
          </div>
          {zomerProducts.length === 0 && (
            <p className="text-center text-amber-900 py-8">{t('emptySummer')}</p>
          )}
        </div>
      </section>

      {/* Zachte overgang zomer → winter */}
      <div className="h-20 bg-gradient-to-b from-yellow-200 to-sky-900" aria-hidden="true" />

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
                sold={soldFor(product.id)}
              />
            ))}
          </div>
          {winterProducts.length === 0 && (
            <p className="text-center text-sky-200 py-8">{t('emptyWinter')}</p>
          )}
        </div>
      </section>

      {/* Zachte overgang winter → licht */}
      <div className="h-20 bg-gradient-to-b from-indigo-950 to-gray-50" aria-hidden="true" />

      <HomeReviews
        recent={recentReviews}
        avg={reviewSummary.avg}
        count={reviewSummary.count}
        products={products.map(p => ({ id: p.id, name: p.name }))}
      />

      {/* FAQ */}
      <section id="faq" className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{faq('title')}</h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-xl bg-gray-50 open:bg-white"
              >
                <summary className="cursor-pointer font-semibold text-gray-900 px-5 py-4 flex items-center justify-between">
                  {item.q}
                  <span className="text-gray-400 group-open:hidden">+</span>
                  <span className="text-gray-400 hidden group-open:inline">−</span>
                </summary>
                <p className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  )
}