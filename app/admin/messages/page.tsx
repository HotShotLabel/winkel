'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  name: string
  messages: ContactMessage[]
  isPlatform: boolean
}

interface OrderInfo {
  id: string
  created_at: string
  status: string
  total: number
  tracking_code: string | null
}

const STATUS_LABEL: Record<string, string> = {
  paid: 'Betaald',
  shipped: 'Verzonden',
  pending: 'In behandeling',
}

function buildThreads(data: ContactMessage[]): Thread[] {
  const byThread = new Map<string, ContactMessage[]>()
  for (const m of data) {
    const key = m.thread_id || m.id
    if (!byThread.has(key)) byThread.set(key, [])
    byThread.get(key)!.push(m)
  }
  const list: Thread[] = []
  for (const [id, msgs] of Array.from(byThread.entries())) {
    const sorted = msgs.sort((a: ContactMessage, b: ContactMessage) =>
      a.created_at.localeCompare(b.created_at)
    )
    const first = sorted[0]
    list.push({
      id,
      subject: first.subject || 'Geen onderwerp',
      email: first.email,
      name: first.name || '',
      messages: sorted,
      isPlatform: first.thread_id !== null,
    })
  }
  list.sort((a, b) => b.messages[0].created_at.localeCompare(a.messages[0].created_at))
  return list
}

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [orders, setOrders] = useState<OrderInfo[] | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const lastJsonRef = useRef('')

  const load = useCallback(() => {
    adminFetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        const list = buildThreads(data)
        const json = JSON.stringify(list)
        if (json !== lastJsonRef.current) {
          lastJsonRef.current = json
          setThreads(list)
        }
      })
      .catch(err => console.error('Failed to fetch messages:', err))
  }, [])

  // Eerste lading
  useEffect(() => {
    load()
  }, [load])

  // Live poll: elke 5 seconden nieuwe berichten ophalen
  useEffect(() => {
    const iv = setInterval(load, 5000)
    return () => clearInterval(iv)
  }, [load])

  // Bestellingen van de klant laden bij het openen van een gesprek
  useEffect(() => {
    const thread = threads.find(t => t.id === openId)
    if (!thread || !thread.email) {
      setOrders(null)
      return
    }
    setOrdersLoading(true)
    setOrders(null)
    adminFetch(`/api/contact/orders?email=${encodeURIComponent(thread.email)}`)
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => setOrders(null))
      .finally(() => setOrdersLoading(false))
  }, [openId, threads])

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
        load()
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
        zien klanten in hun account bij 'Mijn berichten'. Ververst automatisch.
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
                      {thread.messages.some(m => m.is_admin_reply) ? ' · beantwoord' : ' · nieuw'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(thread.messages[0].created_at).toLocaleString('nl-NL')}
                  </span>
                </button>

                {openId === thread.id && (
                  <div className="px-6 pb-5">
                    {/* Klantinfo + bestellingen */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {thread.name || thread.email} · {thread.email}
                      </p>
                      {ordersLoading ? (
                        <p className="text-xs text-gray-400">Bestellingen laden...</p>
                      ) : orders && orders.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Bestellingen ({orders.length})
                          </p>
                          {orders.map(o => (
                            <div key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <span className="font-mono text-gray-700">{o.id}</span>
                              <span className="text-gray-400">
                                {new Date(o.created_at).toLocaleDateString('nl-NL')}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full ${
                                o.status === 'paid' ? 'bg-green-100 text-green-800' :
                                o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-gray-800'
                              }`}>
                                {STATUS_LABEL[o.status] || o.status}
                              </span>
                              <span className="text-gray-900 font-medium">€{Number(o.total).toFixed(2)}</span>
                              {o.tracking_code && (
                                <span className="text-blue-700 font-mono">tracking: {o.tracking_code}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Geen bestellingen gevonden voor dit e-mailadres.</p>
                      )}
                    </div>

                    {/* Berichten */}
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
                              {m.is_admin_reply ? 'AllesIn1Winkel' : (m.name || m.email)}
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
