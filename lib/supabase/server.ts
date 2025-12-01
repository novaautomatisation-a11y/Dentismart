// lib/supabase/server.ts
/**
 * Client Supabase pour usage côté serveur (Server Components, API Routes)
 * Gère automatiquement les cookies pour la session utilisateur
 * Respecte les RLS policies car utilise le token de l'utilisateur connecté
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - cookies() peut être appelé en read-only
            // Les cookies seront setés via middleware ou route handler
          }
        },
      },
    }
  )
}
