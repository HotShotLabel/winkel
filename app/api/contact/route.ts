import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/notifications'

// Honeypot anti-spam: verborgen veld dat echte gebruikers nooit invullen.
export async function POST(request: Request) {
  try {
    const { name, email, subject, message, company } = await request.json()

    if (company) {
      // Bot — stuur netjes 200 terug maar doe niets
      return NextResponse.json({ ok: true })
    }

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Vul alle verplichte velden in' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Versturen mislukt' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 })
  }
}
