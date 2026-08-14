'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Review {
  id: number
  product_id: string
  name: string
  rating: number
  comment: string
  created_at: string
}

function Stars({ rating, className = 'text-amber-400 text-lg' }: { rating: number; className?: string }) {
  return (
    <span className={className} aria-label={`${rating}/5`}>
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function ReviewSection({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews: Review[]
}) {
  const t = useTranslations('reviews')
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [website, setWebsite] = useState('') // honeypot, verborgen
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok' | 'error'>('idle')

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          name,
          rating,
          comment,
          website,
        }),
      })
      if (!res.ok) throw new Error('failed')
      const review = await res.json()
      if (review?.id) {
        setReviews(prev => [review, ...prev])
        setName('')
        setComment('')
        setRating(5)
      }
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1">
            <Stars rating={Math.round(avg)} className="text-amber-400" />
            <span className="text-sm font-semibold text-gray-800">
              {avg.toFixed(1)} / 5 ({reviews.length})
            </span>
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-500 mb-8">{t('empty')}</p>
      ) : (
        <div className="space-y-4 mb-8">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900">{r.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <Stars rating={r.rating} />
              <p className="text-gray-600 text-sm mt-2">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl">
        <h3 className="font-semibold text-gray-900 mb-4">{t('write')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rev-name">
              {t('name')}
            </label>
            <input
              id="rev-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rev-rating">
              {t('rating')}
            </label>
            <select
              id="rev-rating"
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rev-comment">
            {t('comment')}
          </label>
          <textarea
            id="rev-comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {/* Honeypot — onzichtbaar voor mensen */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {t('submit')}
        </button>
        {status === 'ok' && (
          <p className="mt-3 text-sm font-medium text-green-700">{t('thanks')}</p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm font-medium text-red-600">{t('error')}</p>
        )}
      </form>
    </div>
  )
}
