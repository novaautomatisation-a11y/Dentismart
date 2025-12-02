// components/rendezvous/RendezVousList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Dentiste {
  id: string | any
  full_name: string | any
}

interface Patient {
  id: string | any
  first_name: string | any
  last_name: string | any
  phone: string | any
  email: string | null | any
}

interface RendezVous {
  id: string
  starts_at: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  dentistes: Dentiste[] | Dentiste | null
  patients: Patient[] | Patient | null
}

const statusLabels = {
  scheduled: { label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
  no_show: { label: 'Absent', color: 'bg-orange-100 text-orange-800' },
}

export default function RendezVousList({ rendezVous: initialRendezVous }: { rendezVous: RendezVous[] }) {
  const [rendezVous, setRendezVous] = useState(initialRendezVous)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleStatusChange = async (rdvId: string, newStatus: string) => {
    setLoading(rdvId)
    const { error } = await supabase
      .from('rendez_vous')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', rdvId)

    if (error) {
      alert('Erreur lors de la mise à jour du statut')
    } else {
      router.refresh()
    }
    setLoading(null)
  }

  const handleSendReminder = async (rdvId: string) => {
    if (!confirm('Envoyer un rappel SMS pour ce rendez-vous ?')) return

    setLoading(rdvId)
    const response = await fetch('/api/rendezvous/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rendezVousId: rdvId }),
    })

    const data = await response.json()
    if (data.success) {
      alert('Rappel SMS envoyé avec succès !')
    } else {
      alert(`Erreur : ${data.error}`)
    }
    setLoading(null)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Rendez-vous à venir ({rendezVous.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {rendezVous.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun rendez-vous à venir</div>
        ) : (
          rendezVous.map((rdv) => (
            <div key={rdv.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {new Date(rdv.starts_at).toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      {' à '}
                      {new Date(rdv.starts_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusLabels[rdv.status].color}`}>
                      {statusLabels[rdv.status].label}
                    </span>
                  </div>

                  {rdv.patients && (
                    <div className="mt-1 text-sm text-gray-700">
                      👤 {Array.isArray(rdv.patients)
                        ? `${rdv.patients[0]?.first_name} ${rdv.patients[0]?.last_name}`
                        : `${rdv.patients.first_name} ${rdv.patients.last_name}`}
                      {' • 📞 '}
                      {Array.isArray(rdv.patients)
                        ? rdv.patients[0]?.phone
                        : rdv.patients.phone}
                    </div>
                  )}

                  {rdv.dentistes && (
                    <div className="mt-1 text-xs text-gray-500">
                      👨‍⚕️ {Array.isArray(rdv.dentistes)
                        ? rdv.dentistes[0]?.full_name
                        : rdv.dentistes.full_name}
                    </div>
                  )}

                  {rdv.notes && (
                    <div className="mt-1 text-xs text-gray-500 italic">
                      📝 {rdv.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <select
                    value={rdv.status}
                    onChange={(e) => handleStatusChange(rdv.id, e.target.value)}
                    disabled={loading === rdv.id}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                    <option value="no_show">Absent</option>
                  </select>

                  <button
                    onClick={() => handleSendReminder(rdv.id)}
                    disabled={loading === rdv.id}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    📱 Rappel SMS
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
