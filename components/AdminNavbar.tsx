'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNavbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Admin
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/orders" 
                className={`text-sm ${pathname === '/admin/orders' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Bestellingen
              </Link>
              <Link 
                href="/admin/products" 
                className={`text-sm ${pathname === '/admin/products' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Producten
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
              ← Terug naar winkel
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
