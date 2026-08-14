import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AdminProvider } from '@/components/AdminContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mijn Winkel',
  description: 'Snel en eenvoudig online bestellen',
  verification: {
    google: 'XXa1YMZyN_R_KpIflhpMBRDuY6rdVqPpg7NeSgTifWo',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  )
}
