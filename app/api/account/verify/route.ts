import { NextResponse } from 'next/server'
import { verifyToken, createSessionToken } from '@/lib/magiclink'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token ontbreekt' }, { status: 400 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Link is verlopen of ongeldig' }, { status: 401 })
  }

  // Wissel magic link om naar langere sessie-token
  const sessionToken = createSessionToken(payload.email)

  return NextResponse.json({ email: payload.email, sessionToken })
}