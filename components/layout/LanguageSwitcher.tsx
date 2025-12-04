'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LanguageSwitcherProps {
  currentLocale: string
  userId: string
}

const languages = [
  { code: 'fr-CH', label: 'FR', flag: '🇫🇷' },
  { code: 'de-CH', label: 'DE', flag: '🇩🇪' },
  { code: 'it-CH', label: 'IT', flag: '🇮🇹' },
  { code: 'en-US', label: 'EN', flag: '🇬🇧' }
]

export function LanguageSwitcher({ currentLocale, userId }: LanguageSwitcherProps) {
  const [locale, setLocale] = useState(currentLocale || 'fr-CH')
  const [showMenu, setShowMenu] = useState(false)
  const [updating, setUpdating] = useState(false)

  const supabase = createClient()

  const handleChangeLanguage = async (newLocale: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ locale: newLocale })
        .eq('id', userId)

      if (error) throw error

      setLocale(newLocale)
      setShowMenu(false)

      // Reload to apply changes
      window.location.reload()
    } catch (error) {
      console.error('Error updating language:', error)
      alert('Erreur lors du changement de langue')
    } finally {
      setUpdating(false)
    }
  }

  const currentLang = languages.find(l => l.code === locale) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={updating}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleChangeLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  locale === lang.code ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {locale === lang.code && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
