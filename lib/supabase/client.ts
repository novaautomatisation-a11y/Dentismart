// lib/supabase/client.ts
/**
 * Client Supabase pour usage côté navigateur (Client Components)
 * Utilise la clé publique ANON - sécurisé par RLS
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
