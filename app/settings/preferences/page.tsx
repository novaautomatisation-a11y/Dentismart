import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { PreferencesForm } from '@/components/settings/PreferencesForm'

export const dynamic = 'force-dynamic'

export default async function PreferencesPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Préférences</h1>
          <p className="text-gray-600 mt-1">
            Personnalisez votre expérience utilisateur
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <PreferencesForm user={data.user} />
        </div>
      </div>
    </AppShell>
  )
}
