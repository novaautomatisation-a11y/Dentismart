import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and cabinet_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('cabinet_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Only owners and assistants can create campaigns
    if (profile.role === 'dentist') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { patientIds } = body

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ error: 'Invalid patient IDs' }, { status: 400 })
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        cabinet_id: profile.cabinet_id,
        created_by: user.id,
        name: `Réactivation - ${new Date().toLocaleDateString('fr-CH')}`,
        type: 'reactivation',
        channel: 'sms',
        message_template: 'Bonjour, cela fait un moment que nous ne vous avons pas vu. Souhaitez-vous prendre rendez-vous ?',
        status: 'draft'
      })
      .select()
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // Create campaign recipients
    const recipients = patientIds.map(patientId => ({
      campaign_id: campaign.id,
      cabinet_id: profile.cabinet_id,
      patient_id: patientId,
      status: 'pending' as const
    }))

    const { error: recipientsError } = await supabase
      .from('campaign_recipients')
      .insert(recipients)

    if (recipientsError) {
      console.error('Recipients creation error:', recipientsError)
      // Rollback: delete campaign
      await supabase.from('campaigns').delete().eq('id', campaign.id)
      return NextResponse.json({ error: 'Failed to create campaign recipients' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        recipientsCount: patientIds.length
      }
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
