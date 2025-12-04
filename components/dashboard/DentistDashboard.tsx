import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface DentistDashboardProps {
  user: UserProfile
}

export async function DentistDashboard({ user }: DentistDashboardProps) {
  const supabase = await createClient()

  // Get dentiste record linked to this user
  const { data: dentiste } = await supabase
    .from('dentistes')
    .select('id, full_name')
    .eq('full_name', user.full_name || '')
    .single()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get today's appointments
  const { data: todayRdv } = await supabase
    .from('rendez_vous')
    .select('*, patients(*)')
    .eq('dentiste_id', dentiste?.id || '')
    .gte('starts_at', today.toISOString())
    .lt('starts_at', tomorrow.toISOString())
    .order('starts_at')

  const rdvCount = todayRdv?.length || 0
  const firstRdv = todayRdv?.[0]
  const lastRdv = todayRdv?.[todayRdv.length - 1]

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Votre journée</h1>
        <p className="text-gray-600 mt-1">
          Bonjour Dr. {user.full_name || 'Utilisateur'}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-700">{rdvCount}</div>
            <div className="text-sm text-blue-600 mt-1">Rendez-vous aujourd'hui</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-lg font-bold text-green-700">
              {firstRdv ? new Date(firstRdv.starts_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-green-600 mt-1">Premier RDV</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-lg font-bold text-orange-700">
              {lastRdv ? new Date(lastRdv.starts_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-orange-600 mt-1">Dernier RDV</div>
          </div>
        </div>
      </div>

      {/* Timeline of appointments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Planning du jour</h2>
        {todayRdv && todayRdv.length > 0 ? (
          <div className="space-y-3">
            {todayRdv.map((rdv: any) => (
              <div key={rdv.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="text-sm font-medium text-gray-900 w-20">
                  {new Date(rdv.starts_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {rdv.patients?.first_name} {rdv.patients?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{rdv.notes || 'Consultation'}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rdv.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  rdv.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {rdv.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm">Aucun rendez-vous aujourd'hui</div>
            </div>
          </div>
        )}
      </div>

      {/* Patients à suivre */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patients à suivre</h2>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm">Fonctionnalité à venir</div>
          </div>
        </div>
      </div>
    </div>
  )
}
