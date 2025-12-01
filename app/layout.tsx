// app/layout.tsx
/**
 * Layout racine de l'application
 * Appliqué à toutes les pages
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dentismart - Gestion de cabinet dentaire',
  description: 'Solution SaaS suisse pour cabinets dentaires et médicaux',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
