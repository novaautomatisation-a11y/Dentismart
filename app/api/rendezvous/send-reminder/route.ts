// app/api/rendezvous/send-reminder/route.ts
/**
 * API Route pour envoyer un rappel SMS
 * POST /api/rendezvous/send-reminder
 * Body: { rendezVousId: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendReminderSms } from '@/lib/messaging/twilio'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le cabinet_id de l'utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('cabinet_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profil non trouvé' },
        { status: 403 }
      )
    }

    // Récupérer le rendezVousId du body
    const body = await request.json()
    const { rendezVousId } = body

    if (!rendezVousId) {
      return NextResponse.json(
        { success: false, error: 'rendezVousId manquant' },
        { status: 400 }
      )
    }

    // Vérifier que le rendez-vous appartient au cabinet de l'utilisateur
    const { data: rdv } = await supabase
      .from('rendez_vous')
      .select('cabinet_id')
      .eq('id', rendezVousId)
      .single()

    if (!rdv || rdv.cabinet_id !== profile.cabinet_id) {
      return NextResponse.json(
        { success: false, error: 'Rendez-vous non trouvé ou non autorisé' },
        { status: 403 }
      )
    }

    // Envoyer le SMS
    const result = await sendReminderSms(rendezVousId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
