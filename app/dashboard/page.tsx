import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard'
import { DentistDashboard } from '@/components/dashboard/DentistDashboard'
import { AssistantDashboard } from '@/components/dashboard/AssistantDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  // Redirect based on role
  if (data.user.role === 'dentist') {
    redirect('/dentist/dashboard')
  } else if (data.user.role === 'assistant') {
    redirect('/assistant/dashboard')
  }

  // Owner dashboard
  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <OwnerDashboard user={data.user} cabinetId={data.cabinet.id} />
    </AppShell>
  )
}
