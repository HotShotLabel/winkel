'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/orders'

interface CartItem extends Product {
  quantity: number
  option?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, option?: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'mijnwinkel_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Laad cart uit localStorage bij mount
  useEffect(() => {
    setItems(loadCart())
    setLoaded(true)
  }, [])

  // Bewaar cart bij elke wijziging (pas NÁ het laden, anders overschrijft een
  // eerste lege render de opgeslagen cart — StrictMode-remount bug)
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage niet beschikbaar (privacy mode) — cart werkt dan alleen in-sessie
    }
  }, [items, loaded])

  const MAX_QUANTITY = 10

  const addToCart = (product: Product, quantity = 1, option?: string) => {
    setItems(prev => {
      // Met optie = aparte entry (zelfde product, ander model)
      if (option) {
        const key = `${product.id}_${option}`
        const existing = prev.find(item => item.id + '_' + (item.option || '') === key)
        if (existing) {
          return prev.map(item =>
            item.id + '_' + (item.option || '') === key
              ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) }
              : item
          )
        }
        return [...prev, { ...product, quantity: Math.min(quantity, MAX_QUANTITY), option }]
      }
      // Zonder optie: zoals eerst
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) }
            : item
        )
      }
      return [...prev, { ...product, quantity: Math.min(quantity, MAX_QUANTITY) }]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
