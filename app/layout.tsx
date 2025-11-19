import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Legal Complaint Generator',
  description: 'Generate professional legal complaints using AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <nav className="glass-dark text-white p-4 shadow-2xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              Legal Complaint Generator
            </h1>
            <p className="text-gray-200 text-sm mt-1 opacity-90">
              Professional legal document creation powered by AI
            </p>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-6">
          {children}
        </main>
        <footer className="glass-dark text-gray-200 p-4 mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm opacity-90">
              © 2024 Legal Complaint Generator. Secure document generation.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
