// lib/messaging/twilio.ts
/**
 * Module Twilio pour envoi de SMS
 * Configuration et fonction d'envoi de rappels
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function sendReminderSms(rendezVousId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer les infos du rendez-vous
    const { data: rdv, error: rdvError } = await supabase
      .from('rendez_vous')
      .select(`
        id,
        starts_at,
        cabinet_id,
        patients (id, first_name, last_name, phone, language),
        dentistes (full_name),
        cabinets (name, phone)
      `)
      .eq('id', rendezVousId)
      .single()

    if (rdvError || !rdv) {
      return { success: false, error: 'Rendez-vous non trouvé' }
    }

    const patient = rdv.patients as any
    const dentiste = rdv.dentistes as any
    const cabinet = rdv.cabinets as any

    if (!patient || !patient.phone) {
      return { success: false, error: 'Patient ou téléphone manquant' }
    }

    // Formater la date
    const rdvDate = new Date(rdv.starts_at)
    const dateStr = rdvDate.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timeStr = rdvDate.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })

    // Construire le message SMS
    const message = `Bonjour ${patient.first_name},

Rappel de votre rendez-vous chez ${cabinet.name}:
📅 ${dateStr} à ${timeStr}
👨‍⚕️ Dr. ${dentiste.full_name}

Pour toute question: ${cabinet.phone}

À bientôt !`

    // TODO: Intégrer Twilio ici
    // Pour l'instant, on simule l'envoi et on enregistre le message
    console.log(`[TWILIO SIMULATION] Envoi SMS à ${patient.phone}:`, message)

    // Enregistrer le message dans la base
    const { error: insertError } = await supabase.from('messages').insert({
      cabinet_id: rdv.cabinet_id,
      patient_id: patient.id,
      rendez_vous_id: rdv.id,
      channel: 'sms',
      type: 'reminder',
      direction: 'outbound',
      body: message,
      status: 'sent', // En production: 'queued' puis mis à jour par webhook Twilio
      sent_at: new Date().toISOString(),
    })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
