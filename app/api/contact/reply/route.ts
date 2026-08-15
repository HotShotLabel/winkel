import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// POST /api/contact/reply — admin antwoordt op een klantgesprek (platform)
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }

  try {
    const { threadId, message } = await request.json()

    if (!threadId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Bericht ontbreekt' }, { status: 400 })
    }

    const from = process.env.SMTP_FROM?.replace(/^.*</, '').replace(/>.*$/, '') || 'admin'

    const { error: dbError } = await getSupabase()
      .from('contact_messages')
      .insert({
        name: 'MijnWinkel',
        email: from,
        subject: '',
        message: message.trim(),
        thread_id: threadId,
        is_admin_reply: true,
      })
    if (dbError) {
      console.error('Admin reply insert failed:', dbError)
      return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin reply error:', error)
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 })
  }
}
