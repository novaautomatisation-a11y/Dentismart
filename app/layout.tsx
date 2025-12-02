// app/layout.tsx
/**
 * Layout racine de l'application
 * Appliqué à toutes les pages
 */

import type { Metadata } from 'next'
import './globals.css'

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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
