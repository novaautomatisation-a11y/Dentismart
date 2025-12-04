'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'

type Cabinet = Database['public']['Tables']['cabinets']['Row']

interface CabinetFormProps {
  cabinet: Cabinet
}

export function CabinetForm({ cabinet }: CabinetFormProps) {
  const [name, setName] = useState(cabinet.name || '')
  const [address, setAddress] = useState(cabinet.address || '')
  const [phone, setPhone] = useState(cabinet.phone || '')
  const [primaryColor, setPrimaryColor] = useState(cabinet.primary_color || '#0EA5E9')
  const [defaultLocale, setDefaultLocale] = useState(cabinet.default_locale || 'fr-CH')
  const [logoUrl, setLogoUrl] = useState(cabinet.logo_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setMessage(null)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${cabinet.id}/logo-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      setLogoUrl(publicUrl)
      setMessage({ type: 'success', text: 'Logo téléchargé avec succès' })
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
        .from('cabinets')
        .update({
          name,
          address,
          phone,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          default_locale: defaultLocale
        })
        .eq('id', cabinet.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Cabinet mis à jour avec succès' })
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
      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Logo du cabinet
        </label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-20 h-20 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <label
              htmlFor="logo-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {uploading ? 'Téléchargement...' : 'Changer le logo'}
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={uploadLogo}
              disabled={uploading}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">PNG ou SVG recommandé. Max 1MB.</p>
          </div>
        </div>
      </div>

      {/* Cabinet Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom du cabinet
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Cabinet Dentaire du Centre"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Adresse
        </label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Rue de l'Hôpital 10, 1000 Lausanne"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="+41 21 123 45 67"
        />
      </div>

      {/* Primary Color */}
      <div>
        <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
          Couleur principale
        </label>
        <div className="flex items-center gap-3">
          <input
            id="primaryColor"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Couleur utilisée pour le branding de l'interface</p>
      </div>

      {/* Default Locale */}
      <div>
        <label htmlFor="defaultLocale" className="block text-sm font-medium text-gray-700 mb-2">
          Langue par défaut du cabinet
        </label>
        <select
          id="defaultLocale"
          value={defaultLocale}
          onChange={(e) => setDefaultLocale(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="fr-CH">Français (Suisse)</option>
          <option value="de-CH">Deutsch (Schweiz)</option>
          <option value="it-CH">Italiano (Svizzera)</option>
          <option value="en-US">English (US)</option>
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
