import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import RendezVousList from '@/components/rendezvous/RendezVousList'
import RendezVousForm from '@/components/rendezvous/RendezVousForm'

export const dynamic = 'force-dynamic'

export default async function RendezVousPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  const supabase = await createClient()

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
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="text-gray-600 mt-1">
            Planning et gestion des rendez-vous
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RendezVousList rendezVous={rendezVous || []} />
          </div>
          <div className="lg:col-span-1">
            <RendezVousForm
              dentistes={dentistes || []}
              patients={patients || []}
              cabinetId={data.cabinet.id}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
