// app/page.tsx
/**
 * Page d'accueil - redirige vers /dashboard (si connecté) ou /login (sinon)
 * Le middleware gère automatiquement cette logique
 */

import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
