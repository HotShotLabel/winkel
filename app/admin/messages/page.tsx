'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  thread_id: string | null
  is_admin_reply: boolean
  created_at: string
}

interface Thread {
  id: string
  subject: string
  email: string
  messages: ContactMessage[]
  isPlatform: boolean
}

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    adminFetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        const byThread = new Map<string, ContactMessage[]>()
        for (const m of data as ContactMessage[]) {
          const key = m.thread_id || m.id
          if (!byThread.has(key)) byThread.set(key, [])
          byThread.get(key)!.push(m)
        }
        const list: Thread[] = []
        for (const [id, msgs] of Array.from(byThread.entries())) {
          const sorted = msgs.sort((a: ContactMessage, b: ContactMessage) => a.created_at.localeCompare(b.created_at))
          const first = sorted[0]
          const isPlatform = first.thread_id !== null
          list.push({
            id,
            subject: first.subject || 'Geen onderwerp',
            email: first.email,
            messages: sorted,
            isPlatform,
          })
        }
        list.sort((a, b) => a.messages[0].created_at.localeCompare(b.messages[0].created_at)).reverse()
        setThreads(list)
      })
      .catch(err => console.error('Failed to fetch messages:', err))
  }, [])

  const handleReply = async (threadId: string) => {
    const text = (replyTexts[threadId] || '').trim()
    if (!text) return
    setSending(threadId)
    setStatusMsg('')
    try {
      const res = await adminFetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, message: text }),
      })
      if (res.ok) {
        setReplyTexts({ ...replyTexts, [threadId]: '' })
        setStatusMsg('Antwoord verzonden. De klant ziet het bij het inloggen.')
        // Refresh threads
        adminFetch('/api/contact')
          .then(res => res.json())
          .then(data => {
            const byThread = new Map<string, ContactMessage[]>()
            for (const m of data as ContactMessage[]) {
              const key = m.thread_id || m.id
              if (!byThread.has(key)) byThread.set(key, [])
              byThread.get(key)!.push(m)
            }
            const list: Thread[] = []
            for (const [id, msgs] of Array.from(byThread.entries())) {
              const sorted = msgs.sort((a: ContactMessage, b: ContactMessage) => a.created_at.localeCompare(b.created_at))
              const first = sorted[0]
              list.push({
                id,
                subject: first.subject || 'Geen onderwerp',
                email: first.email,
                messages: sorted,
                isPlatform: first.thread_id !== null,
              })
            }
            list.sort((a, b) => a.messages[0].created_at.localeCompare(b.messages[0].created_at)).reverse()
            setThreads(list)
          })
      } else {
        const data = await res.json()
        setStatusMsg(data.error || 'Verzenden mislukt')
      }
    } catch {
      setStatusMsg('Verzenden mislukt')
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactberichten</h1>
      <p className="text-gray-500 mb-4 text-sm">
        Gesprekken van klanten (inloggen) en mails van bezoekers. Antwoorden op klantgesprekken
        zien klanten in hun account bij 'Mijn berichten'.
      </p>

      {statusMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
          {statusMsg}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {threads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nog geen contactberichten.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {threads.map(thread => (
              <li key={thread.id}>
                <button
                  onClick={() => setOpenId(openId === thread.id ? null : thread.id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-start gap-4 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {thread.subject}
                      {!thread.isPlatform && (
                        <span className="ml-2 text-xs font-normal bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                          mail
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{thread.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {thread.messages.length} bericht{thread.messages.length !== 1 ? 'en' : ''}
                      {thread.messages.some(m => m.is_admin_reply) ? ' · beantwoord' : ''}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(thread.messages[0].created_at).toLocaleString('nl-NL')}
                  </span>
                </button>

                {openId === thread.id && (
                  <div className="px-6 pb-5">
                    <div className="space-y-3 mb-4">
                      {thread.messages.map(m => (
                        <div
                          key={m.id}
                          className={`rounded-lg p-3 text-sm ${
                            m.is_admin_reply
                              ? 'bg-blue-50 border border-blue-200 ml-8'
                              : 'bg-gray-50 border border-gray-200 mr-8'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-semibold ${m.is_admin_reply ? 'text-blue-900' : 'text-gray-900'}`}>
                              {m.is_admin_reply ? 'MijnWinkel' : (m.name || m.email)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(m.created_at).toLocaleString('nl-NL')}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{m.message}</p>
                        </div>
                      ))}
                    </div>

                    {thread.isPlatform ? (
                      <div>
                        <textarea
                          rows={2}
                          value={replyTexts[thread.id] || ''}
                          onChange={(e) => setReplyTexts({ ...replyTexts, [thread.id]: e.target.value })}
                          placeholder="Typ je antwoord aan de klant..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                        />
                        <button
                          onClick={() => handleReply(thread.id)}
                          disabled={sending === thread.id || !(replyTexts[thread.id] || '').trim()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                        >
                          {sending === thread.id ? 'Versturen...' : 'Antwoord versturen'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Mail van buitenaf — reageer per e-mail op {thread.email}.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
