// app/api/radar/reactivate/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ReactivatePayload {
  patientIds: string[]
  messageTemplate?: string
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
    const payload: ReactivatePayload = await request.json()
    const { patientIds, messageTemplate } = payload

    if (!patientIds || patientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun patient sélectionné' },
        { status: 400 }
      )
    }

    // 4. Vérifier que tous les patients appartiennent au cabinet de l'utilisateur
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, phone, email, cabinet_id')
      .in('id', patientIds)
      .eq('cabinet_id', cabinetId)

    if (patientsError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des patients' },
        { status: 500 }
      )
    }

    if (!patients || patients.length !== patientIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Certains patients ne sont pas accessibles ou n\'appartiennent pas à votre cabinet',
        },
        { status: 403 }
      )
    }

    // 5. Template de message par défaut
    const defaultTemplate =
      'Bonjour {prenom}, cela fait longtemps que nous ne vous avons pas vu ! Nous serions ravis de prendre soin de votre santé dentaire. Contactez-nous pour prendre rendez-vous.'

    const template = messageTemplate || defaultTemplate

    // 6. Créer les messages pour chaque patient
    const messagesToInsert = patients.map((patient) => ({
      cabinet_id: cabinetId,
      patient_id: patient.id,
      rendez_vous_id: null,
      channel: 'sms',
      type: 'reactivation',
      direction: 'outbound',
      body: template.replace('{prenom}', patient.first_name),
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

    // 7. Retourner le succès
    return NextResponse.json({
      success: true,
      count: patients.length,
      message: `${patients.length} message(s) de réactivation créé(s) et mis en file d'attente`,
    })
  } catch (error) {
    console.error('Erreur API reactivate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
