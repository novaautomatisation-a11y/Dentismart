// components/rendezvous/RendezVousForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Dentiste { id: string; full_name: string }
interface Patient { id: string; first_name: string; last_name: string; phone: string }

interface RendezVousFormProps {
  dentistes: Dentiste[]
  patients: Patient[]
  cabinetId: string
}

export default function RendezVousForm({ dentistes, patients, cabinetId }: RendezVousFormProps) {
  const [patientId, setPatientId] = useState('')
  const [dentisteId, setDentisteId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    if (!patientId || !dentisteId || !date || !time) {
      setError('Tous les champs obligatoires doivent être remplis')
      setLoading(false)
      return
    }

    const startsAt = `${date}T${time}:00`

    try {
      const { error: insertError } = await supabase.from('rendez_vous').insert({
        cabinet_id: cabinetId,
        dentiste_id: dentisteId,
        patient_id: patientId,
        starts_at: startsAt,
        status: 'scheduled',
        notes: notes || null,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setPatientId('')
      setDentisteId('')
      setDate('')
      setTime('')
      setNotes('')
      setLoading(false)
      router.refresh()
    } catch (err) {
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un rendez-vous</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">Rendez-vous créé !</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Patient *</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Sélectionnez un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dentiste *</label>
          <select value={dentisteId} onChange={(e) => setDentisteId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Sélectionnez un dentiste</option>
            {dentistes.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Heure *</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {loading ? 'Création...' : 'Créer le rendez-vous'}
        </button>
      </form>
    </div>
  )
}
