// app/patients/page.tsx
/**
 * Page de gestion des patients
 * Liste tous les patients du cabinet + formulaire CRUD
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PatientsList from '@/components/patients/PatientsList'
import PatientForm from '@/components/patients/PatientForm'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
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

  // Récupérer les patients du cabinet (RLS filtre automatiquement)
  const { data: patients } = await supabase
    .from('patients')
    .select(`
      id,
      first_name,
      last_name,
      phone,
      email,
      language,
      created_at,
      dentiste_id,
      dentistes (
        id,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  // Récupérer les dentistes pour le formulaire
  const { data: dentistes } = await supabase
    .from('dentistes')
    .select('id, full_name, is_active')
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion des patients du cabinet
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
          {/* Liste des patients (2/3) */}
          <div className="lg:col-span-2">
            <PatientsList patients={patients || []} />
          </div>

          {/* Formulaire d'ajout (1/3) */}
          <div className="lg:col-span-1">
            <PatientForm
              dentistes={dentistes || []}
              cabinetId={profile.cabinet_id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
