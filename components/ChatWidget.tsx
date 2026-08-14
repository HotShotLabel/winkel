'use client'

import { useEffect } from 'react'

const TAWK_ID = process.env.NEXT_PUBLIC_TAWK_ID

// Tawk.to chat widget. Laadt alleen als NEXT_PUBLIC_TAWK_ID is geconfigureerd.
// Property-ID invullen in Vercel env om de chat aan te zetten.
export default function ChatWidget() {
  useEffect(() => {
    if (!TAWK_ID || document.querySelector('#tawk-script')) return
    const s = document.createElement('script')
    s.id = 'tawk-script'
    s.async = true
    s.src = `https://embed.tawk.to/${TAWK_ID}/default`
    s.charset = 'UTF-8'
    s.setAttribute('crossorigin', '*')
    document.body.appendChild(s)
  }, [])

  return null
}
