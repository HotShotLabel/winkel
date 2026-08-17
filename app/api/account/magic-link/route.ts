import { NextResponse } from 'next/server'
import { createMagicLinkToken } from '@/lib/magiclink'
import { sendEmail } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
    }

    const token = createMagicLinkToken(email)
    const host = request.headers.get('host')
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (host ? `https://${host}` : 'https://mijnwinkel.vercel.app')
    const loginUrl = `${baseUrl}/account?token=${token}`

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#1a1a1a;">Inloggen bij Alles In 1 Winkel</h2>
      <p>Hallo,</p>
      <p>Klik op de knop hieronder om in te loggen op je account. Daar zie je al je bestellingen en hun status.</p>
      <p style="margin:24px 0;">
        <a href="${loginUrl}" style="background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Inloggen op mijn account
        </a>
      </p>
      <p style="color:#666;font-size:12px;">Deze link is 1 uur geldig. Werkt de knop niet? Kopieer dan deze link:<br>${loginUrl}</p>
      <p style="color:#666;font-size:12px;margin-top:24px;">Vragen? Mail naar mijnwinkel.vercel@proton.me</p>
    </div>
    `.trim()

    const sent = await sendEmail(email, 'Inloggen bij Alles In 1 Winkel', html)

    if (!sent) {
      return NextResponse.json({ error: 'E-mail verzenden mislukt' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 })
  }
}