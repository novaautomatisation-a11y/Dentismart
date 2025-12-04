import { createClient } from './server'
import { Database } from '@/lib/types/database.types'

type UserProfile = Database['public']['Tables']['profiles']['Row']
type Cabinet = Database['public']['Tables']['cabinets']['Row']

export async function getUserProfile(): Promise<{
  user: UserProfile
  cabinet: Cabinet
} | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!profile) {
    return null
  }

  // Récupérer le cabinet
  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('*')
    .eq('id', profile.cabinet_id)
    .single()

  if (!cabinet) {
    return null
  }

  return {
    user: profile,
    cabinet
  }
}
