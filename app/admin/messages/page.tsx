'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    adminFetch('/api/contact')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Failed to fetch messages:', err))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactberichten</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Berichten van het contactformulier op de website. Wordt ook naar je e-mail gestuurd (als dat aankomt).
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nog geen contactberichten.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {messages.map(msg => (
              <li key={msg.id} className="hover:bg-gray-50">
                <button
                  onClick={() => setOpenId(openId === msg.id ? null : msg.id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-start gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {msg.name}
                      {msg.subject && <span className="font-normal text-gray-500"> — {msg.subject}</span>}
                    </p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString('nl-NL')}
                  </span>
                </button>
                {openId === msg.id && (
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-line">
                      {msg.message}
                    </div>
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
