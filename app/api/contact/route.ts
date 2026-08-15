import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/notifications'
import { getSupabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'
import { verifyToken } from '@/lib/magiclink'

export const dynamic = 'force-dynamic'

// GET /api/contact — admin: alle contactberichten
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }
  const { data, error } = await getSupabase()
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json([])
  }
  return NextResponse.json(data || [])
}

// Honeypot anti-spam: verborgen veld dat echte gebruikers nooit invullen.
export async function POST(request: Request) {
  try {
    const { name, email, subject, message, company, threadId } = await request.json()

    if (company) {
      // Bot — stuur netjes 200 terug maar doe niets
      return NextResponse.json({ ok: true })
    }

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul alle verplichte velden in' }, { status: 400 })
    }

    // Sessie check: ingelogde klanten praten op het platform, buitenstaanders mailen
    const auth = request.headers.get('authorization') || ''
    const token = auth.replace('Bearer ', '')
    const session = token ? verifyToken(token) : null

    // Altijd opslaan in DB — bericht is nooit verloren, ook niet als e-mail faalt
    const insert: any = { name, email, subject: subject || '', message }

    if (session) {
      // Platform-bericht van ingelogde klant: identiteit komt uit de sessie, geen mail
      insert.email = session.email
      insert.thread_id = threadId || crypto.randomUUID()
      insert.is_admin_reply = false
      // Antwoord op bestaande thread mag alleen als die thread van deze klant is
      if (threadId) {
        const { data: existing } = await getSupabase()
          .from('contact_messages')
          .select('email')
          .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
          .limit(1)
        const threadOwner = existing?.[0]?.email
        if (!threadOwner || threadOwner !== session.email) {
          return NextResponse.json({ error: 'Gesprek niet gevonden' }, { status: 404 })
        }
      }
      const { error: dbError } = await getSupabase()
        .from('contact_messages')
        .insert(insert)
      if (dbError) {
        console.error('Contact DB insert failed:', dbError)
        return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
      }
      return NextResponse.json({ ok: true, platform: true })
    }

    // Buitenstaander: alleen mailen (best effort) — bericht komt als mail binnen
    const { error: dbError } = await getSupabase()
      .from('contact_messages')
      .insert(insert)
    if (dbError) {
      console.error('Contact DB insert failed:', dbError)
    }

    // E-mail als melding (best effort — DB is de bron van waarheid)
    const to = process.env.SMTP_FROM?.replace(/^.*</, '').replace(/>.*$/, '') || ''
    const sent = await sendEmail(
      to,
      `Contactformulier: ${subject || 'Geen onderwerp'}`,
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a1a1a;">Nieuw contactformulier</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;width:100px;">Naam</td><td style="padding:6px 0;"><strong>${name}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><strong>${email}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Onderwerp</td><td style="padding:6px 0;"><strong>${subject || '-'}</strong></td></tr>
        </table>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;white-space:pre-line;">${message}</div>
      </div>
      `.trim()
    )

    if (!sent) {
      console.warn('Contact email failed, but message saved to DB')
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 })
  }
}
