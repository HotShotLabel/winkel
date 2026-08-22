import { getProduct, localizeProduct, getPaidOrderCounts, getProducts } from '@/lib/orders'
import { getProductPrices } from '@/lib/prices'
import { getReviews } from '@/lib/reviews'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { absoluteUrl, languageAlternates } from '@/lib/seo'
import { getProductOptions } from '@/lib/productOptions'
import AddToCartButton from '@/components/AddToCartButton'
import ProductOptions from '@/components/ProductOptions'
import ReviewSection from '@/components/ReviewSection'
import WishlistButton from '@/components/WishlistButton'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string }
}): Promise<Metadata> {
  const { locale } = params
  const product = await getProduct(params.id)
  if (!product) return {}

  const localized = localizeProduct(product, locale)
  const path = `/product/${product.id}`
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: `${localized.name} — ${t('title')}`,
    description: localized.description,
    alternates: {
      canonical: absoluteUrl(locale, path),
      languages: languageAlternates(locale, path),
    },
    openGraph: {
      title: localized.name,
      description: localized.description,
      type: 'website',
      locale: locale === 'nl' ? 'nl_NL' : locale,
      images: product.image ? [{ url: product.image, alt: localized.name }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const t = await getTranslations('product')
  const locale = await getLocale()
  const productRaw = await getProduct(params.id)
  if (!productRaw) {
    notFound()
  }
  const product = localizeProduct(productRaw, locale)
  const number = product.number

  const prices = await getProductPrices()
  const oldPrice = prices[product.id]?.old_price
  const discountPct =
    oldPrice && oldPrice > product.price
      ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
      : null

  const [reviews, orderCounts] = await Promise.all([
    getReviews(product.id),
    getPaidOrderCounts(),
  ])
  const soldCount = orderCounts[product.id] || 0
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  // Gerelateerde producten: 4 andere producten (nieuwste eerst)
  const allProducts = await getProducts()
  const related = allProducts.filter(p => p.id !== product.id).slice(0, 4)
  const relatedPrices = await getProductPrices()

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image || undefined,
    ...(avgRating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(locale, `/product/${product.id}`),
    },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-3">
        <Link href="/" className="hover:text-blue-600">
          {t('home')}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        {t('back')}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
          {number && <p className="text-sm text-gray-400 mb-3">Artikelnummer: {number}</p>}

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-400 text-lg">{'★'.repeat(Math.round(avgRating))}</span>
              <span className="text-sm text-gray-600">
                {avgRating.toFixed(1)} / 5 ({reviews.length})
              </span>
            </div>
          )}

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
                  {t('discountPct', { pct: discountPct! })}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3">
            {getProductOptions(product.id) ? (
              <ProductOptions product={product} large />
            ) : (
              <AddToCartButton product={product} large />
            )}
            <WishlistButton productId={product.id} showLabel className="px-4 py-3 border border-gray-200" />
          </div>

          {/* Social proof */}
          {soldCount > 0 && (
            <p className="mt-4 text-sm font-medium text-green-700">
              ✓ {soldCount} {t('soldToday')}
            </p>
          )}

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-lg">🚚</span>
              <span className="text-sm font-medium text-gray-700">{t('trust1')}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-lg">↩️</span>
              <span className="text-sm font-medium text-gray-700">{t('trust2')}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium text-gray-700">{t('trust3')}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-lg">💳</span>
              <span className="text-sm font-medium text-gray-700">{t('trust4')}</span>
            </div>
          </div>

          {/* Garantie-blok */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="font-semibold text-green-800 mb-2">{t('guaranteeTitle')}</h2>
            <ul className="text-sm text-green-700 space-y-1">
              <li>{t('guarantee1')}</li>
              <li>{t('guarantee2')}</li>
              <li>{t('guarantee3')}</li>
            </ul>
          </div>

          {/* Verzending */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h2 className="font-semibold text-blue-900 mb-2">{t('shipTitle')}</h2>
            <p className="text-sm text-blue-800 mb-2">
              {t('shipText')}
            </p>
            <p className="text-sm text-blue-700 mb-1">{t('shipInStock')}</p>
            <p className="text-sm text-blue-700">{t('shipOutOfStock')}</p>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-1">
              <Link href="/garantie" className="text-blue-600 hover:underline">
                {t('guaranteeLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Beoordelingen */}
      <ReviewSection productId={product.id} initialReviews={reviews} />

      {/* Gerelateerde producten */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('relatedTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(rp => {
              const localized = localizeProduct(rp, locale)
              const relOldPrice = relatedPrices[rp.id]?.old_price
              return (
                <Link
                  key={rp.id}
                  href={`/product/${rp.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    {rp.image ? (
                      <img src={rp.image} alt={localized.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {localized.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        €{localized.price.toFixed(2)}
                      </span>
                      {relOldPrice && relOldPrice > localized.price && (
                        <span className="text-sm text-gray-400 line-through">
                          €{relOldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
