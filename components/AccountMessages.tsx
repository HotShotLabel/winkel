'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const SESSION_KEY = 'mijnwinkel_session'

interface Msg {
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
  messages: Msg[]
}

export default function AccountMessages({ locale }: { locale: string }) {
  const t = useTranslations('account')
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const [sendingNew, setSendingNew] = useState(false)
  const [sentNew, setSentNew] = useState(false)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [sendingReply, setSendingReply] = useState<string | null>(null)

  const getToken = (): string | null => {
    try {
      const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
      return stored?.token || null
    } catch {
      return null
    }
  }

  const load = () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    fetch('/api/account/messages', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.messages) return
        // Groepeer op thread (thread_id of eigen id voor losse berichten)
        const byThread = new Map<string, Msg[]>()
        for (const m of data.messages as Msg[]) {
          const key = m.thread_id || m.id
          if (!byThread.has(key)) byThread.set(key, [])
          byThread.get(key)!.push(m)
        }
        const list: Thread[] = []
        for (const [id, msgs] of Array.from(byThread.entries())) {
          const sorted = msgs.sort((a: Msg, b: Msg) => a.created_at.localeCompare(b.created_at))
          const first = sorted[0]
          list.push({
            id,
            subject: first.subject || t('threadClosed'),
            messages: sorted,
          })
        }
        setThreads(list)
      })
      .catch(() => setError(t('errLoad')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingNew(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          name: 'klant',
          email: 'klant@placeholder.nl', // identiteit komt uit sessie
          subject: newSubject,
          message: newBody,
          company: '',
        }),
      })
      if (res.ok) {
        setSentNew(true)
        setNewSubject('')
        setNewBody('')
        load()
      } else {
        const data = await res.json()
        setError(data.error || t('errGeneric'))
      }
    } catch {
      setError(t('errGeneric'))
    } finally {
      setSendingNew(false)
    }
  }

  const handleReply = async (threadId: string) => {
    const text = (replyTexts[threadId] || '').trim()
    if (!text) return
    setSendingReply(threadId)
    setError('')
    try {
      const token = getToken()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          name: 'klant',
          email: 'klant@placeholder.nl',
          subject: '',
          message: text,
          threadId,
          company: '',
        }),
      })
      if (res.ok) {
        setReplyTexts({ ...replyTexts, [threadId]: '' })
        load()
      } else {
        const data = await res.json()
        setError(data.error || t('errGeneric'))
      }
    } catch {
      setError(t('errGeneric'))
    } finally {
      setSendingReply(null)
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('messages')}</h2>
      <p className="text-gray-600 mb-6">{t('messagesText')}</p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {sentNew && (
        <p className="text-green-700 text-sm mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          {t('messageSent')}
        </p>
      )}

      {/* Nieuw bericht */}
      <form onSubmit={handleNew} className="bg-white rounded-lg shadow p-6 space-y-4 mb-8">
        <h3 className="font-semibold text-gray-900">{t('newMessage')}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('messageSubject')}</label>
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('messageBody')}</label>
          <textarea
            required
            rows={4}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={sendingNew}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {sendingNew ? t('loading') : t('sendMessage')}
        </button>
      </form>

      {/* Gesprekken */}
      {loading ? (
        <p className="text-gray-600">{t('loading')}</p>
      ) : threads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {t('noMessages')}
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map(thread => (
            <div key={thread.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 font-semibold text-gray-900">
                {thread.subject}
              </div>
              <div className="px-6 py-4 space-y-3">
                {thread.messages.map(m => (
                  <div
                    key={m.id}
                    className={`rounded-lg p-3 text-sm ${
                      m.is_admin_reply
                        ? 'bg-blue-50 border border-blue-200 ml-6'
                        : 'bg-gray-50 border border-gray-200 mr-6'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold ${m.is_admin_reply ? 'text-blue-900' : 'text-gray-900'}`}>
                        {m.is_admin_reply ? t('adminLabel') : t('youLabel')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(m.created_at).toLocaleString(locale)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{m.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-4">
                <textarea
                  rows={2}
                  value={replyTexts[thread.id] || ''}
                  onChange={(e) => setReplyTexts({ ...replyTexts, [thread.id]: e.target.value })}
                  placeholder={t('replyPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                />
                <button
                  onClick={() => handleReply(thread.id)}
                  disabled={sendingReply === thread.id || !(replyTexts[thread.id] || '').trim()}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-400 text-sm"
                >
                  {sendingReply === thread.id ? t('loading') : t('sendReply')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
