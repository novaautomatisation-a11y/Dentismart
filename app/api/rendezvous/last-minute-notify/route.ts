// app/api/rendezvous/last-minute-notify/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface LastMinuteNotifyPayload {
  rendezVousId: string
  maxRecipients?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // 2. Récupérer le profil et le cabinet_id de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('cabinet_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    const cabinetId = profile.cabinet_id

    // 3. Parser le payload
    const payload: LastMinuteNotifyPayload = await request.json()
    const { rendezVousId, maxRecipients = 5 } = payload

    if (!rendezVousId) {
      return NextResponse.json(
        { success: false, error: 'ID du rendez-vous manquant' },
        { status: 400 }
      )
    }

    // 4. Récupérer le rendez-vous et vérifier qu'il appartient au cabinet
    const { data: rdv, error: rdvError } = await supabase
      .from('rendez_vous')
      .select('id, cabinet_id, status, starts_at, dentiste_id')
      .eq('id', rendezVousId)
      .eq('cabinet_id', cabinetId)
      .single()

    if (rdvError || !rdv) {
      return NextResponse.json(
        { success: false, error: 'Rendez-vous introuvable ou non accessible' },
        { status: 404 }
      )
    }

    // 5. Vérifier que le rendez-vous est bien annulé
    if (rdv.status !== 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le rendez-vous doit être annulé pour proposer le créneau',
        },
        { status: 400 }
      )
    }

    // 6. Vérifier que le rendez-vous est dans moins de 48h
    const rdvDate = new Date(rdv.starts_at)
    const now = new Date()
    const hoursUntilRdv = (rdvDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilRdv > 48 || hoursUntilRdv < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le rendez-vous doit être dans moins de 48h et dans le futur',
        },
        { status: 400 }
      )
    }

    // 7. Récupérer les patients flexibles (accepts_short_notice = true)
    const { data: flexiblePatients, error: patientsError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, phone, email')
      .eq('cabinet_id', cabinetId)
      .eq('accepts_short_notice', true)
      .limit(maxRecipients)

    if (patientsError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des patients' },
        { status: 500 }
      )
    }

    if (!flexiblePatients || flexiblePatients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun patient flexible trouvé dans votre cabinet',
        },
        { status: 404 }
      )
    }

    // 8. Créer le message pour chaque patient
    const rdvDateFormatted = rdvDate.toLocaleDateString('fr-CH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })

    const messagesToInsert = flexiblePatients.map((patient) => ({
      cabinet_id: cabinetId,
      patient_id: patient.id,
      rendez_vous_id: rendezVousId,
      channel: 'sms',
      type: 'last_minute_offer',
      direction: 'outbound',
      body: `Bonjour ${patient.first_name}, un créneau s'est libéré le ${rdvDateFormatted}. Si vous êtes intéressé(e), contactez-nous rapidement !`,
      status: 'queued',
      provider_message_id: null,
      sent_at: null,
      received_at: null,
    }))

    const { error: insertError } = await supabase
      .from('messages')
      .insert(messagesToInsert)

    if (insertError) {
      console.error('Erreur insertion messages:', insertError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création des messages' },
        { status: 500 }
      )
    }

    // 9. Retourner le succès
    return NextResponse.json({
      success: true,
      count: flexiblePatients.length,
      message: `${flexiblePatients.length} patient(s) flexible(s) notifié(s)`,
    })
  } catch (error) {
    console.error('Erreur API last-minute-notify:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
