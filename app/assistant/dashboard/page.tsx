import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/helpers'
import { AppShell } from '@/components/layout/AppShell'
import { AssistantDashboard } from '@/components/dashboard/AssistantDashboard'

export const dynamic = 'force-dynamic'

export default async function AssistantDashboardPage() {
  const data = await getUserProfile()

  if (!data) {
    redirect('/login')
  }

  if (data.user.role !== 'assistant') {
    redirect('/dashboard')
  }

  return (
    <AppShell user={data.user} cabinetName={data.cabinet.name}>
      <AssistantDashboard cabinetId={data.cabinet.id} />
    </AppShell>
  )
}
