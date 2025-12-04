import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { ScoreDentismart } from './ScoreDentismart'
import { RadarPatientsSilencieux } from './RadarPatientsSilencieux'
import { CampagnesRecentes } from './CampagnesRecentes'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface OwnerDashboardProps {
  user: UserProfile
  cabinetId: string
}

export async function OwnerDashboard({ user, cabinetId }: OwnerDashboardProps) {
  const supabase = await createClient()

  // Dates pour les calculs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

  // Stats de base
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })

  const { count: rdvToday } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', today.toISOString())
    .lt('starts_at', tomorrow.toISOString())

  const { count: rdvTomorrow } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', tomorrow.toISOString())
    .lt('starts_at', dayAfterTomorrow.toISOString())

  // Calcul du Score Dentismart (6 derniers mois)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { count: totalRdvSixMonths } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', sixMonthsAgo.toISOString())

  const { count: noShowsSixMonths } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'no_show')
    .gte('starts_at', sixMonthsAgo.toISOString())

  const noShowRate = totalRdvSixMonths && totalRdvSixMonths > 0
    ? (noShowsSixMonths || 0) / totalRdvSixMonths
    : 0
  const score = Math.max(0, 100 - Math.round(noShowRate * 100))

  // Patients silencieux (dernière visite > 12 mois)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  // Query pour trouver les patients silencieux
  const { data: patientsData } = await supabase
    .from('patients')
    .select('id, first_name, last_name, phone, dentiste_id')
    .limit(100)

  let silentPatientsCount = 0
  if (patientsData) {
    for (const patient of patientsData) {
      const { data: lastRdv } = await supabase
        .from('rendez_vous')
        .select('starts_at')
        .eq('patient_id', patient.id)
        .in('status', ['completed', 'confirmed'])
        .order('starts_at', { ascending: false })
        .limit(1)
        .single()

      if (!lastRdv || new Date(lastRdv.starts_at) < twelveMonthsAgo) {
        silentPatientsCount++
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Left: Welcome + KPIs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vue d'ensemble de votre cabinet
            </h1>
            <p className="text-gray-600 mt-1">
              Bonjour {user.full_name || 'Dr.'}, voici un résumé de votre activité
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-sky-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-sky-700">{score}</div>
              <div className="text-sm text-sky-600 mt-1">Score Dentismart</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-700">{rdvToday ?? 0}</div>
              <div className="text-sm text-green-600 mt-1">RDV aujourd'hui</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-700">{silentPatientsCount}</div>
              <div className="text-sm text-orange-600 mt-1">Patients silencieux</div>
            </div>
          </div>
        </div>

        {/* Right: Score Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <ScoreDentismart score={score} noShowRate={noShowRate} />
        </div>
      </div>

      {/* Grid Below Hero */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Agenda & Charge (2 columns) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agenda & Charge</h2>
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <div>Mini calendrier mensuel</div>
              <div className="text-sm">(à implémenter en Phase 4)</div>
            </div>
          </div>
        </div>

        {/* Patients Silencieux */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <RadarPatientsSilencieux cabinetId={cabinetId} count={silentPatientsCount} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campagnes Récentes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <CampagnesRecentes cabinetId={cabinetId} />
        </div>

        {/* Annulations last-minute */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Annulations last-minute</h2>
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-sm">Aucune annulation récente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
