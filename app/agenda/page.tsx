import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">
            Vue calendrier hebdomadaire de vos rendez-vous
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-lg text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-xl font-medium mb-2">Vue Agenda</div>
              <div className="text-sm">Calendrier hebdomadaire avec gestion des rendez-vous</div>
              <div className="text-sm mt-1">À implémenter en Phase 4</div>
              <div className="mt-4 text-sm text-gray-500">
                En attendant, utilisez la page <a href="/rendezvous" className="text-blue-500 underline">Rendez-vous</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
