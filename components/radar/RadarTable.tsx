'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SilentPatient {
  id: string
  firstName: string
  lastName: string
  phone: string
  dentisteName: string
  lastVisit: string | null
}

interface RadarTableProps {
  cabinetId: string
}

export function RadarTable({ cabinetId }: RadarTableProps) {
  const [silentPatients, setSilentPatients] = useState<SilentPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set())
  const [monthsFilter, setMonthsFilter] = useState(12)
  const [creating, setCreating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadSilentPatients()
  }, [monthsFilter])

  const loadSilentPatients = async () => {
    setLoading(true)
    try {
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsFilter)

      // Récupérer tous les patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, dentiste_id')

      if (!patients) {
        setSilentPatients([])
        return
      }

      // Pour chaque patient, vérifier sa dernière visite
      const silent: SilentPatient[] = []

      for (const patient of patients) {
        const { data: lastRdv } = await supabase
          .from('rendez_vous')
          .select('starts_at')
          .eq('patient_id', patient.id)
          .in('status', ['completed', 'confirmed'])
          .order('starts_at', { ascending: false })
          .limit(1)
          .single()

        const lastVisitDate = lastRdv ? new Date(lastRdv.starts_at) : null
        const isSilent = !lastVisitDate || lastVisitDate < cutoffDate

        if (isSilent) {
          // Récupérer le nom du dentiste
          let dentisteName = 'Non assigné'
          if (patient.dentiste_id) {
            const { data: dentiste } = await supabase
              .from('dentistes')
              .select('full_name')
              .eq('id', patient.dentiste_id)
              .single()
            if (dentiste) dentisteName = dentiste.full_name
          }

          silent.push({
            id: patient.id,
            firstName: patient.first_name,
            lastName: patient.last_name,
            phone: patient.phone,
            dentisteName,
            lastVisit: lastVisitDate ? lastVisitDate.toISOString() : null
          })
        }
      }

      setSilentPatients(silent)
    } catch (error) {
      console.error('Error loading silent patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePatient = (patientId: string) => {
    const newSet = new Set(selectedPatients)
    if (newSet.has(patientId)) {
      newSet.delete(patientId)
    } else {
      newSet.add(patientId)
    }
    setSelectedPatients(newSet)
  }

  const toggleAll = () => {
    if (selectedPatients.size === silentPatients.length) {
      setSelectedPatients(new Set())
    } else {
      setSelectedPatients(new Set(silentPatients.map(p => p.id)))
    }
  }

  const createCampaign = async () => {
    if (selectedPatients.size === 0) {
      alert('Veuillez sélectionner au moins un patient')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/campaigns/reactivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientIds: Array.from(selectedPatients)
        })
      })

      if (!response.ok) throw new Error('Failed to create campaign')

      alert('Campagne créée avec succès !')
      setSelectedPatients(new Set())
    } catch (error: any) {
      alert('Erreur: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {silentPatients.length} patients silencieux détectés
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedPatients.size} patient(s) sélectionné(s)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthsFilter(12)}
            className={`px-3 py-1 text-sm rounded-lg ${
              monthsFilter === 12 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            12 mois
          </button>
          <button
            onClick={() => setMonthsFilter(18)}
            className={`px-3 py-1 text-sm rounded-lg ${
              monthsFilter === 18 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            18 mois
          </button>
          <button
            onClick={() => setMonthsFilter(24)}
            className={`px-3 py-1 text-sm rounded-lg ${
              monthsFilter === 24 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            24 mois
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedPatients.size === silentPatients.length && silentPatients.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dentiste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière visite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {silentPatients.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedPatients.has(patient.id)}
                    onChange={() => togglePatient(patient.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{patient.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{patient.firstName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.dentisteName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {patient.lastVisit
                    ? new Date(patient.lastVisit).toLocaleDateString('fr-CH')
                    : 'Jamais'
                  }
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-6 border-t flex justify-end">
        <button
          onClick={createCampaign}
          disabled={selectedPatients.size === 0 || creating}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Création...' : `Créer une campagne de réactivation (${selectedPatients.size})`}
        </button>
      </div>
    </div>
  )
}
