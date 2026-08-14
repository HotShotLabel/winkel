'use client'

import { useState } from 'react'
import AdminNavbar from '@/components/AdminNavbar'
import { useAdmin } from '@/components/AdminContext'

function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin()
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <LoginForm />
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAdmin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(password)
    if (ok) {
      setPassword('')
      setError('')
    } else {
      setError('Verkeerd wachtwoord')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
      />
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Inloggen
      </button>
    </form>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <AdminLoginGate>
        <main>
          {children}
        </main>
      </AdminLoginGate>
    </div>
  )
}
