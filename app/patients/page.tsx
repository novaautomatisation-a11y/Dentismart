import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import PatientsList from '@/components/patients/PatientsList'
import PatientForm from '@/components/patients/PatientForm'

export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  const supabase = await createClient()

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
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            Gestion des patients du cabinet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PatientsList patients={patients || []} />
          </div>
          <div className="lg:col-span-1">
            <PatientForm
              dentistes={dentistes || []}
              cabinetId={data.cabinet.id}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
