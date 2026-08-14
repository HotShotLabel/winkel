import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()

    // Honeypot tegen spam
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email) || email.length > 200) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
    }

    const { error } = await getSupabase()
      .from('newsletter_subscribers')
      .insert({ email })

    if (error) {
      // Unieke sleutel: al ingeschreven is geen fout voor de bezoeker.
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, already: true }, { status: 201 })
      }
      console.error('Error adding subscriber:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
