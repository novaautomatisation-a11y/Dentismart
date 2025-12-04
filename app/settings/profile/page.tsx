import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { ProfileForm } from '@/components/settings/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfileSettingsPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <ProfileForm user={data.user} />
        </div>
      </div>
    </AppShell>
  )
}
