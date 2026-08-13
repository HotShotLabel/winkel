'use client'

import Link from 'next/link'
import { useAdmin } from '@/components/AdminContext'

export default function AdminPage() {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <p className="text-gray-600 text-sm">Gebruik het wachtwoord uit .env.local</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bestellingen</h3>
          <p className="text-gray-600">Bekijk en beheer alle bestellingen, voeg trackingcodes toe.</p>
        </Link>
        <Link href="/admin/products" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Producten</h3>
          <p className="text-gray-600">Voeg producten toe, bewerk prijzen en afbeeldingen.</p>
        </Link>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stripe</h3>
          <p className="text-gray-600">Bekijk betalingen in je <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Dashboard</a></p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Instellingen</h3>
          <p className="text-gray-600">Pas site aan in <code className="bg-gray-100 px-1 rounded">.env.local</code></p>
        </div>
      </div>
    </div>
  )
}
