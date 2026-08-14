import { NextResponse } from 'next/server'
import { getAliExpressSources, saveAliExpressSources } from '@/lib/aliexpress'

export async function GET() {
  const sources = await getAliExpressSources()
  return NextResponse.json(sources)
}

export async function PUT(request: Request) {
  try {
    const sources = await request.json()
    const ok = await saveAliExpressSources(sources)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to save sources' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save sources' }, { status: 500 })
  }
}