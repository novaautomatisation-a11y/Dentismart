import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { CabinetForm } from '@/components/settings/CabinetForm'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CabinetSettingsPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  // Only owners can access cabinet settings
  if (data.user.role !== 'owner') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  // Get dentistes list
  const { data: dentistes } = await supabase
    .from('dentistes')
    .select('*')
    .eq('cabinet_id', data.cabinet.id)
    .order('full_name')

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du cabinet</h1>
          <p className="text-gray-600 mt-1">
            Gérez les informations et le branding de votre cabinet
          </p>
        </div>

        {/* Cabinet Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <CabinetForm cabinet={data.cabinet} />
          </div>

          {/* Dentistes List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Équipe</h2>
            {dentistes && dentistes.length > 0 ? (
              <div className="space-y-3">
                {dentistes.map(dentiste => (
                  <div key={dentiste.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{dentiste.full_name}</div>
                      <div className="text-sm text-gray-500">{dentiste.speciality || 'Dentiste'}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      dentiste.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {dentiste.is_active ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun dentiste enregistré</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
