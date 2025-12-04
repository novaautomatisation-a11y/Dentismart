import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function WaitlistPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  if (data.user.role === 'dentist') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: waitlist } = await supabase
    .from('waitlist')
    .select(`
      id,
      preferred_days,
      preferred_times,
      priority,
      notes,
      created_at,
      patients (
        id,
        first_name,
        last_name,
        phone
      )
    `)
    .order('priority', { ascending: false })

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste d'attente</h1>
          <p className="text-gray-600 mt-1">
            Patients en attente d'un créneau disponible
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">{waitlist?.length || 0} patient(s)</h2>

          {waitlist && waitlist.length > 0 ? (
            <div className="space-y-3">
              {waitlist.map((entry: any) => (
                <div key={entry.id} className="p-4 border rounded-lg">
                  <div className="font-medium">{entry.patients?.first_name} {entry.patients?.last_name}</div>
                  <div className="text-sm text-gray-600 mt-1">{entry.patients?.phone}</div>
                  <div className="text-sm text-gray-500 mt-2">{entry.notes || 'Aucune note'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">⏱️</div>
              <div>Aucun patient en liste d'attente</div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
