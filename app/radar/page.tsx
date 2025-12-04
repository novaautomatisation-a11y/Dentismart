import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { RadarTable } from '@/components/radar/RadarTable'

export const dynamic = 'force-dynamic'

export default async function RadarPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  // Only owners and assistants can access radar
  if (data.user.role === 'dentist') {
    redirect('/dashboard')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radar patients silencieux</h1>
          <p className="text-gray-600 mt-1">
            Identifiez et réactivez les patients qui n'ont pas consulté depuis longtemps
          </p>
        </div>

        <RadarTable cabinetId={data.cabinet.id} />
      </div>
    </AppShell>
  )
}
