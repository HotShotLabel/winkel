'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Mijn Winkel
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-gray-900 hover:text-gray-600">
              Producten
            </Link>
            <Link href="/cart" className="text-gray-900 hover:text-gray-600">
              Winkelmand
            </Link>
            <Link href="/admin" className="text-gray-500 hover:text-gray-900 text-sm">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
