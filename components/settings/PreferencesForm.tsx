'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface PreferencesFormProps {
  user: UserProfile
}

export function PreferencesForm({ user }: PreferencesFormProps) {
  const prefs = (user.ui_preferences as any) || {}

  const [density, setDensity] = useState<'normal' | 'compact'>(prefs.density || 'normal')
  const [showMiniCalendar, setShowMiniCalendar] = useState(prefs.show_mini_calendar !== false)
  const [showOpportunities, setShowOpportunities] = useState(prefs.show_opportunities_block !== false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ui_preferences: {
            density,
            show_mini_calendar: showMiniCalendar,
            show_opportunities_block: showOpportunities
          }
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Préférences mises à jour avec succès' })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Density */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Densité d'affichage
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="normal"
              checked={density === 'normal'}
              onChange={() => setDensity('normal')}
              className="mr-2"
            />
            <span>Normal - Plus d'espaces pour une meilleure lisibilité</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="compact"
              checked={density === 'compact'}
              onChange={() => setDensity('compact')}
              className="mr-2"
            />
            <span>Compact - Afficher plus d'informations à l'écran</span>
          </label>
        </div>
      </div>

      {/* Dashboard Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Options du dashboard
        </label>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <span>Afficher le mini calendrier</span>
            <input
              type="checkbox"
              checked={showMiniCalendar}
              onChange={(e) => setShowMiniCalendar(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <span>Afficher le bloc d'opportunités</span>
            <input
              type="checkbox"
              checked={showOpportunities}
              onChange={(e) => setShowOpportunities(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
