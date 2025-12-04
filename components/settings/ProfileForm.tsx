'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface ProfileFormProps {
  user: UserProfile
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [locale, setLocale] = useState(user.locale || 'fr-CH')
  const [timezone, setTimezone] = useState(user.timezone || 'Europe/Zurich')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setMessage(null)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAvatarUrl(publicUrl)
      setMessage({ type: 'success', text: 'Photo téléchargée avec succès' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          locale,
          timezone,
          avatar_url: avatarUrl || null
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Photo de profil
        </label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-medium">
              {getInitials(fullName)}
            </div>
          )}
          <div>
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {uploading ? 'Téléchargement...' : 'Changer la photo'}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Nom complet
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Dr. Jean Dupont"
        />
      </div>

      {/* Role (read-only) */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Rôle
        </label>
        <input
          id="role"
          type="text"
          value={user.role === 'owner' ? 'Propriétaire' : user.role === 'dentist' ? 'Dentiste' : 'Assistant(e)'}
          disabled
          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">Le rôle ne peut pas être modifié</p>
      </div>

      {/* Locale */}
      <div>
        <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-2">
          Langue
        </label>
        <select
          id="locale"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="fr-CH">Français (Suisse)</option>
          <option value="de-CH">Deutsch (Schweiz)</option>
          <option value="it-CH">Italiano (Svizzera)</option>
          <option value="en-US">English (US)</option>
        </select>
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
          Fuseau horaire
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="Europe/Zurich">Europe/Zurich</option>
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="Europe/Berlin">Europe/Berlin</option>
        </select>
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
