'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAdmin } from '@/components/AdminContext'

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAdmin()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

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
              <Link 
                href="/admin/coupons" 
                className={`text-sm ${pathname === '/admin/coupons' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Kortingscodes
              </Link>
              <Link 
                href="/admin/messages" 
                className={`text-sm ${pathname === '/admin/messages' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
              ← Terug naar winkel
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
