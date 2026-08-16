'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface HomeReview {
  id: number
  name: string
  rating: number
  comment: string
}

interface HomeProduct {
  id: string
  name: string
}

// Blok met de laatste reviews + formulier zodat bezoekers zelf een review kunnen plaatsen.
export default function HomeReviews({
  recent,
  avg,
  count,
  products,
}: {
  recent: HomeReview[]
  avg: number
  count: number
  products: HomeProduct[]
}) {
  const t = useTranslations('home')
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2 || comment.trim().length < 5 || !productId) return
    setState('sending')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, name: name.trim(), rating, comment: comment.trim() }),
      })
      if (res.ok) {
        setName('')
        setComment('')
        setRating(5)
        setState('done')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 border-t border-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⭐</div>
          <h2 className="text-3xl font-bold text-gray-900">{t('reviewsTitle')}</h2>
          <p className="text-gray-600 mt-2">
            {t('reviewsSub', { avg: avg.toFixed(1), count })}
          </p>
          <div className="mt-2 text-amber-400 text-xl tracking-widest">
            {'★'.repeat(Math.round(avg))}
            <span className="text-gray-300">{'★'.repeat(5 - Math.round(avg))}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Laatste reviews */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {recent.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="text-amber-400 mb-2">{'★'.repeat(r.rating)}<span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span></div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.comment}"</p>
                <p className="text-sm font-semibold text-gray-900">— {r.name}</p>
              </div>
            ))}
          </div>

          {/* Formulier */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('reviewFormTitle')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('reviewFormSub')}</p>

            {state === 'done' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm">
                ✅ {t('reviewThanks')}
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviewName')}</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder={t('reviewNamePh')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviewProduct')}</label>
                  <select
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviewRating')}</label>
                  <div className="flex gap-1 text-2xl">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={n <= rating ? 'text-amber-400' : 'text-gray-300'}
                        aria-label={`${n} sterren`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('reviewComment')}</label>
                  <textarea
                    required
                    rows={3}
                    maxLength={1000}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder={t('reviewCommentPh')}
                  />
                </div>
                {state === 'error' && (
                  <p className="text-red-600 text-sm">{t('reviewError')}</p>
                )}
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {state === 'sending' ? t('reviewSending') : t('reviewSubmit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}