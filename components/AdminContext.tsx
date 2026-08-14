'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminContextType {
  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  adminPassword: string
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const STORAGE_KEY = 'mijnwinkel_admin_auth'
const PASSWORD_KEY = 'mijnwinkel_admin_key'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  // Herstel sessie bij reload
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        setIsAuthenticated(true)
        setAdminPassword(localStorage.getItem(PASSWORD_KEY) || '')
      }
    } catch {
      // storage niet beschikbaar
    }
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) return false

      setIsAuthenticated(true)
      setAdminPassword(password)
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
        localStorage.setItem(PASSWORD_KEY, password)
      } catch {
        // ignore
      }
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setAdminPassword('')
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PASSWORD_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout, adminPassword }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}