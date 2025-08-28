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
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-dark-900 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-primary-400">
              Legal Complaint Generator
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Professional legal document creation powered by AI
            </p>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-6">
          {children}
        </main>
        <footer className="bg-dark-800 text-gray-300 p-4 mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm">
              © 2024 Legal Complaint Generator. Secure document generation.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
