'use client'

import { Product } from '@/lib/orders'
import { useCart } from '@/components/Cart'
import { useState } from 'react'

export default function AddToCartButton({ product, large = false }: { product: Product; large?: boolean }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`${large ? 'w-full text-lg py-4' : 'px-4 py-2'} ${
        added ? 'bg-green-600' : 'bg-blue-600'
      } text-white font-semibold rounded-lg hover:opacity-90 transition-colors`}
    >
      {added ? '✓ Toegevoegd' : 'In winkelmand'}
    </button>
  )
}
