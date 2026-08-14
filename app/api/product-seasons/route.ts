import { NextResponse } from 'next/server'
import { getProductSeasons, saveProductSeasons } from '@/lib/seasons'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const seasons = await getProductSeasons()
  return NextResponse.json(seasons)
}

export async function PUT(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }
    const seasons = await request.json()
    const ok = await saveProductSeasons(seasons)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to save seasons' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save seasons' }, { status: 500 })
  }
}