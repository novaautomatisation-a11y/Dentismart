import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  if (data.user.role !== 'owner') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { count: totalRdv } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', sixMonthsAgo.toISOString())

  const { count: noShows } = await supabase
    .from('rendez_vous')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'no_show')
    .gte('starts_at', sixMonthsAgo.toISOString())

  const noShowRate = totalRdv ? ((noShows || 0) / totalRdv * 100).toFixed(1) : '0'

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Performance de votre cabinet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-gray-600">RDV (6 mois)</div>
            <div className="text-3xl font-bold mt-2">{totalRdv || 0}</div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-gray-600">No-shows</div>
            <div className="text-3xl font-bold mt-2 text-red-600">{noShows || 0}</div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-gray-600">Taux no-show</div>
            <div className="text-3xl font-bold mt-2 text-red-600">{noShowRate}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Graphiques détaillés</h2>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>Graphiques à venir (Phase 4)</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
