import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { CartProvider } from '@/components/Cart'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mijn Winkel',
  description: 'Snel en eenvoudig online bestellen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}
