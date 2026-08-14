'use client'

import Link from 'next/link'
import { useAdmin } from '@/components/AdminContext'
import { useCart } from '@/components/Cart'

export default function Navbar() {
  const { isAuthenticated } = useAdmin()
  const { itemCount } = useCart()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link href="/" className="text-base sm:text-xl font-bold text-gray-900">
              Mijn Winkel
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-base">
            <Link href="/" className="hidden sm:inline text-gray-900 hover:text-gray-600">
              Producten
            </Link>
            <Link href="/cart" className="text-gray-900 hover:text-gray-600 flex items-center gap-1.5 sm:gap-2">
              <span>Winkelmand</span>
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="cart-badge inline-flex items-center justify-center min-w-[1.5rem] h-5 sm:h-6 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold"
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="text-gray-900 hover:text-gray-600">
              <span className="hidden sm:inline">Mijn </span>account
            </Link>
            {isAuthenticated && (
              <Link href="/admin" className="text-gray-500 hover:text-gray-900 text-xs">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}