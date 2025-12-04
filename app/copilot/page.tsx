import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'

export const dynamic = 'force-dynamic'

export default async function CopilotPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  if (data.user.role === 'assistant') {
    redirect('/dashboard')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Copilot IA</h1>
          <p className="text-gray-600 mt-1">
            Posez des questions sur vos données et obtenez des insights
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[500px] flex flex-col">
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <div className="text-xl font-medium mb-2">Copilot IA</div>
              <div className="text-sm">Interface de chat intelligente</div>
              <div className="text-sm mt-1">À implémenter en Phase 5</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Posez une question... (désactivé pour le moment)"
                disabled
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
              />
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
