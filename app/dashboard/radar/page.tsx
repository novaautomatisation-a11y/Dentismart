// app/dashboard/radar/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RadarPatientsList from '@/components/radar/RadarPatientsList'

export const dynamic = 'force-dynamic'

interface LostPatient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  last_visit_at: string | null
  months_since_visit: number | null
}

export default async function RadarPage() {
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

  const cabinetId = profile.cabinet_id

  // Récupérer les patients "perdus" (pas de visite depuis 12 mois)
  // On fait une requête SQL complexe via la fonction RPC ou via une jointure
  const { data: allPatients } = await supabase
    .from('patients')
    .select(`
      id,
      first_name,
      last_name,
      phone,
      email
    `)
    .eq('cabinet_id', cabinetId)
    .order('last_name')

  if (!allPatients || allPatients.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">📡 Radar des patients perdus</h1>
        <p className="text-gray-600">Aucun patient trouvé dans votre cabinet.</p>
      </div>
    )
  }

  // Pour chaque patient, récupérer le dernier rendez-vous completed/confirmed
  const lostPatients: LostPatient[] = []

  for (const patient of allPatients) {
    const { data: lastVisit } = await supabase
      .from('rendez_vous')
      .select('starts_at, status')
      .eq('patient_id', patient.id)
      .eq('cabinet_id', cabinetId)
      .in('status', ['completed', 'confirmed'])
      .order('starts_at', { ascending: false })
      .limit(1)
      .single()

    if (!lastVisit) {
      // Patient sans aucune visite completed/confirmed = patient perdu dès le début
      lostPatients.push({
        ...patient,
        last_visit_at: null,
        months_since_visit: null,
      })
    } else {
      const lastVisitDate = new Date(lastVisit.starts_at)
      const now = new Date()
      const monthsSince =
        (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

      // Si plus de 12 mois, c'est un patient perdu
      if (monthsSince > 12) {
        lostPatients.push({
          ...patient,
          last_visit_at: lastVisit.starts_at,
          months_since_visit: Math.round(monthsSince),
        })
      }
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          📡 Radar des patients perdus
        </h1>
        <p className="text-gray-600 mt-2">
          Patients sans visite depuis plus de 12 mois. Lancez une campagne de
          réactivation pour les reconquérir.
        </p>
      </div>

      {lostPatients.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-medium">
            ✅ Aucun patient perdu ! Tous vos patients sont actifs.
          </p>
        </div>
      ) : (
        <RadarPatientsList patients={lostPatients} />
      )}
    </div>
  )
}
