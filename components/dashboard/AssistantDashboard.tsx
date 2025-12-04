import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface AssistantDashboardProps {
  cabinetId: string
}

export async function AssistantDashboard({ cabinetId }: AssistantDashboardProps) {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  // Stats
  const { count: rdvToday } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', today.toISOString())
    .lt('starts_at', tomorrow.toISOString())

  const { count: rdvCancelled } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('starts_at', twoDaysAgo.toISOString())

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Aujourd'hui au cabinet</h1>
        <p className="text-gray-600 mt-1">
          {today.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-700">{rdvToday ?? 0}</div>
            <div className="text-sm text-blue-600 mt-1">RDV prévus</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-700">{rdvCancelled ?? 0}</div>
            <div className="text-sm text-red-600 mt-1">Annulations 48h</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-700">0</div>
            <div className="text-sm text-green-600 mt-1">Créneaux libres</div>
          </div>
        </div>
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

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/patients"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-gray-900">Gérer les patients</h3>
          <p className="text-sm text-gray-600 mt-1">Ajouter, modifier, consulter</p>
        </Link>

        <Link
          href="/radar"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900">Radar patients</h3>
          <p className="text-sm text-gray-600 mt-1">Créer des campagnes de réactivation</p>
        </Link>
      </div>
    </div>
  )
}
