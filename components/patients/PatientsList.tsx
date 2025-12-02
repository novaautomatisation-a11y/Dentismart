// components/patients/PatientsList.tsx
'use client'

/**
 * Liste des patients avec actions
 */

import { useState } from 'react'

interface Dentiste {
  id: string | any
  full_name: string | any
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  language: string | null
  created_at: string
  dentiste_id: string | null
  dentistes: Dentiste[] | Dentiste | null
}

interface PatientsListProps {
  patients: Patient[]
}

export default function PatientsList({ patients: initialPatients }: PatientsListProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrer les patients par nom/prénom/téléphone
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    return (
      fullName.includes(search) ||
      patient.phone.includes(search) ||
      patient.email?.toLowerCase().includes(search)
    )
  })

  const handleDelete = async (patientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      return
    }

    // TODO: Implémenter la suppression via API
    alert('Fonctionnalité de suppression à implémenter')
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header avec recherche */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des patients ({filteredPatients.length})
          </h2>
        </div>

        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Liste */}
      <div className="divide-y divide-gray-200">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient pour le moment'}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    {patient.language && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {patient.language.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    📞 {patient.phone}
                    {patient.email && ` • ✉️ ${patient.email}`}
                  </div>

                  {patient.dentistes && (
                    <div className="mt-1 text-xs text-gray-500">
                      👨‍⚕️ {Array.isArray(patient.dentistes)
                        ? patient.dentistes[0]?.full_name
                        : patient.dentistes.full_name}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Fonctionnalité d\'édition à implémenter')}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Supprimer
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
