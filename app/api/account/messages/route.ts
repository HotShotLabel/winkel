import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/magiclink'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/account/messages — alle berichten (gesprekken) van de ingelogde klant
export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Sessie verlopen, log opnieuw in' }, { status: 401 })
  }

  // Eigen berichten + alle shop-antwoorden binnen de eigen gesprekken (threads)
  const { data: own, error } = await getSupabase()
    .from('contact_messages')
    .select('id, name, email, subject, message, thread_id, is_admin_reply, created_at')
    .eq('email', payload.email)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Account messages fetch failed:', error)
    return NextResponse.json({ messages: [] })
  }

  const threadIds = Array.from(
    new Set((own || []).map((m: any) => m.thread_id).filter(Boolean))
  )

  let replies: any[] = []
  if (threadIds.length > 0) {
    const { data: r } = await getSupabase()
      .from('contact_messages')
      .select('id, name, email, subject, message, thread_id, is_admin_reply, created_at')
      .eq('is_admin_reply', true)
      .in('thread_id', threadIds)
    replies = r || []
  }

  const messages = [...(own || []), ...replies].sort((a: any, b: any) =>
    a.created_at.localeCompare(b.created_at)
  )

  return NextResponse.json({ email: payload.email, messages })
}
