import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const valid = process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD
    if (!valid) {
      return NextResponse.json({ error: 'Ongeldig wachtwoord' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }
}