// app/dashboard/page.tsx
/**
 * Dashboard principal - Server Component
 * Affiche les statistiques du cabinet de l'utilisateur connecté
 * Utilise createClient() côté serveur pour bénéficier des RLS automatiques
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import LogoutButton from '@/components/dashboard/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le profil et le cabinet_id de l'utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('cabinet_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Récupérer le nom du cabinet
  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('name')
    .eq('id', profile.cabinet_id)
    .single()

  // Stats: Nombre total de patients (RLS filtre automatiquement par cabinet_id)
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })

  // Stats: Rendez-vous aujourd'hui
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { count: rdvToday } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', today.toISOString())
    .lt('starts_at', tomorrow.toISOString())

  // Stats: Rendez-vous demain
  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

  const { count: rdvTomorrow } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', tomorrow.toISOString())
    .lt('starts_at', dayAfterTomorrow.toISOString())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dentismart</h1>
            <p className="text-sm text-gray-600 mt-1">
              {cabinet?.name || 'Cabinet'} • {profile.role === 'owner' ? 'Propriétaire' : 'Personnel'}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Tableau de bord</h2>
          <p className="text-sm text-gray-600 mt-1">
            Vue d'ensemble de votre activité
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Patients total"
            value={totalPatients ?? 0}
            description="Dans votre cabinet"
            icon="👥"
          />
          <StatsCard
            title="Rendez-vous aujourd'hui"
            value={rdvToday ?? 0}
            description={new Date().toLocaleDateString('fr-CH', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
            icon="📅"
          />
          <StatsCard
            title="Rendez-vous demain"
            value={rdvTomorrow ?? 0}
            description={tomorrow.toLocaleDateString('fr-CH', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
            icon="🗓️"
          />
        </div>

        {/* Placeholder for future sections */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Prochaines fonctionnalités
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Authentification sécurisée multi-tenant</li>
            <li>✅ Dashboard avec statistiques en temps réel</li>
            <li>🔜 Gestion des patients (PHASE 2)</li>
            <li>🔜 Gestion des rendez-vous (PHASE 2)</li>
            <li>🔜 Envoi automatique de rappels SMS (PHASE 2)</li>
            <li>🔜 Demandes d'avis Google automatisées</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
