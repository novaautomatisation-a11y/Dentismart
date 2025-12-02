// components/patients/PatientForm.tsx
'use client'

/**
 * Formulaire d'ajout/modification de patient
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Dentiste {
  id: string
  full_name: string
  is_active: boolean
}

interface PatientFormProps {
  dentistes: Dentiste[]
  cabinetId: string
}

export default function PatientForm({ dentistes, cabinetId }: PatientFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('fr')
  const [dentisteId, setDentisteId] = useState('')
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

    try {
      const { error: insertError } = await supabase.from('patients').insert({
        cabinet_id: cabinetId,
        dentiste_id: dentisteId || null,
        first_name: firstName,
        last_name: lastName,
        phone,
        email: email || null,
        language,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      // Succès
      setSuccess(true)
      setLoading(false)

      // Réinitialiser le formulaire
      setFirstName('')
      setLastName('')
      setPhone('')
      setEmail('')
      setLanguage('fr')
      setDentisteId('')

      // Rafraîchir la page pour afficher le nouveau patient
      router.refresh()
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Ajouter un patient
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
            Patient ajouté avec succès !
          </div>
        )}

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom *
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Téléphone *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+41 79 123 45 67"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Langue
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="fr">Français</option>
            <option value="de">Allemand</option>
            <option value="it">Italien</option>
            <option value="en">Anglais</option>
          </select>
        </div>

        <div>
          <label htmlFor="dentiste" className="block text-sm font-medium text-gray-700">
            Dentiste attitré
          </label>
          <select
            id="dentiste"
            value={dentisteId}
            onChange={(e) => setDentisteId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Aucun dentiste attitré</option>
            {dentistes.map((dentiste) => (
              <option key={dentiste.id} value={dentiste.id}>
                {dentiste.full_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le patient'}
        </button>
      </form>
    </div>
  )
}
