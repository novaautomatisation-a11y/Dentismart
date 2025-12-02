// app/rendezvous/page.tsx
/**
 * Page de gestion des rendez-vous
 * Liste + formulaire CRUD + changement statut + envoi rappels
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RendezVousList from '@/components/rendezvous/RendezVousList'
import RendezVousForm from '@/components/rendezvous/RendezVousForm'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function RendezVousPage() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le profil et cabinet_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('cabinet_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Récupérer les rendez-vous à venir (RLS filtre automatiquement)
  const { data: rendezVous } = await supabase
    .from('rendez_vous')
    .select(`
      id,
      starts_at,
      status,
      notes,
      created_at,
      dentistes (
        id,
        full_name
      ),
      patients (
        id,
        first_name,
        last_name,
        phone,
        email
      )
    `)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(50)

  // Récupérer les dentistes pour le formulaire
  const { data: dentistes } = await supabase
    .from('dentistes')
    .select('id, full_name, is_active')
    .eq('is_active', true)
    .order('full_name')

  // Récupérer les patients pour le formulaire
  const { data: patients } = await supabase
    .from('patients')
    .select('id, first_name, last_name, phone')
    .order('last_name')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
              <p className="text-sm text-gray-600 mt-1">
                Planning et gestion des rendez-vous
              </p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Retour au dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des rendez-vous (2/3) */}
          <div className="lg:col-span-2">
            <RendezVousList rendezVous={rendezVous || []} />
          </div>

          {/* Formulaire d'ajout (1/3) */}
          <div className="lg:col-span-1">
            <RendezVousForm
              dentistes={dentistes || []}
              patients={patients || []}
              cabinetId={profile.cabinet_id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
