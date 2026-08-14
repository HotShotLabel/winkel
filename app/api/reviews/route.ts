import { NextResponse } from 'next/server'
import { getReviews, addReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')
  if (!productId) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 })
  }
  const reviews = await getReviews(productId)
  return NextResponse.json(reviews)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Honeypot tegen spam: verborgen veld 'website' gevuld? Dan negeren.
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 })
    }

    const product_id = String(body.product_id || '').trim()
    const name = String(body.name || '').trim().slice(0, 60)
    const comment = String(body.comment || '').trim().slice(0, 1000)
    const rating = Number(body.rating)

    if (!product_id || !name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Ongeldige beoordeling' }, { status: 400 })
    }

    const review = await addReview({ product_id, name, rating, comment })
    if (!review) {
      return NextResponse.json({ error: 'Failed to add review' }, { status: 500 })
    }
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 })
  }
}
