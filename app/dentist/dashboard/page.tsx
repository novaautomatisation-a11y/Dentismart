import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { DentistDashboard } from '@/components/dashboard/DentistDashboard'

export const dynamic = 'force-dynamic'

export default async function DentistDashboardPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  if (data.user.role !== 'dentist') {
    redirect('/dashboard')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <DentistDashboard user={data.user} />
    </AppShell>
  )
}
