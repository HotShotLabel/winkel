'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Product } from '@/lib/orders'

interface WishlistContextValue {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
  count: number
}

const WishlistContext = createContext<WishlistContextValue>({
  ids: [],
  toggle: () => {},
  has: () => false,
  count: 0,
})

const STORAGE_KEY = 'wishlist-ids'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setIds(JSON.parse(raw))
    } catch {}
  }, [])

  const toggle = (id: string) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const has = (id: string) => ids.includes(id)
  const count = ids.length

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, count }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
