// components/radar/RadarPatientsList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LostPatient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  last_visit_at: string | null
  months_since_visit: number | null
}

interface RadarPatientsListProps {
  patients: LostPatient[]
}

export default function RadarPatientsList({ patients }: RadarPatientsListProps) {
  const router = useRouter()
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleTogglePatient = (patientId: string) => {
    const newSelected = new Set(selectedPatients)
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId)
    } else {
      newSelected.add(patientId)
    }
    setSelectedPatients(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPatients.size === patients.length) {
      setSelectedPatients(new Set())
    } else {
      setSelectedPatients(new Set(patients.map((p) => p.id)))
    }
  }

  const handleReactivateCampaign = async () => {
    if (selectedPatients.size === 0) {
      setMessage({
        type: 'error',
        text: 'Veuillez sélectionner au moins un patient',
      })
      return
    }

    if (
      !confirm(
        `Envoyer une campagne de réactivation à ${selectedPatients.size} patient(s) ?`
      )
    ) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/radar/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientIds: Array.from(selectedPatients),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || `${data.count} message(s) envoyé(s) avec succès !`,
        })
        setSelectedPatients(new Set())
        router.refresh()
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erreur lors de l\'envoi',
        })
      }
    } catch (error) {
      console.error('Erreur campagne réactivation:', error)
      setMessage({
        type: 'error',
        text: 'Erreur serveur lors de l\'envoi',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Message de confirmation/erreur */}
      {message && (
        <div
          className={`mx-6 mt-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header avec actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {patients.length} patient(s) perdu(s)
            </h2>
            {selectedPatients.size > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedPatients.size} sélectionné(s)
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {selectedPatients.size === patients.length
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>
            <button
              onClick={handleReactivateCampaign}
              disabled={loading || selectedPatients.size === 0}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : '📱 Lancer campagne réactivation'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des patients */}
      <div className="divide-y divide-gray-200">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="p-4 hover:bg-gray-50 flex items-center gap-4"
          >
            <input
              type="checkbox"
              checked={selectedPatients.has(patient.id)}
              onChange={() => handleTogglePatient(patient.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h3>
                {!patient.last_visit_at && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                    Jamais venu
                  </span>
                )}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                📞 {patient.phone}
                {patient.email && ` • ✉️ ${patient.email}`}
              </div>

              {patient.last_visit_at && patient.months_since_visit && (
                <div className="mt-1 text-xs text-gray-500">
                  Dernière visite:{' '}
                  {new Date(patient.last_visit_at).toLocaleDateString('fr-CH')} (il
                  y a {patient.months_since_visit} mois)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
