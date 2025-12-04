'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface NavItem {
  label: string
  href: string
  icon: string
  roles: ('owner' | 'dentist' | 'assistant')[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    roles: ['owner', 'dentist', 'assistant']
  },
  {
    label: 'Agenda',
    href: '/agenda',
    icon: '📅',
    roles: ['owner', 'dentist', 'assistant']
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: '👥',
    roles: ['owner', 'dentist', 'assistant']
  },
  {
    label: 'Rendez-vous',
    href: '/rendezvous',
    icon: '🗓️',
    roles: ['owner', 'dentist', 'assistant']
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: '📈',
    roles: ['owner']
  },
  {
    label: 'Radar',
    href: '/radar',
    icon: '🎯',
    roles: ['owner', 'assistant']
  },
  {
    label: 'Waitlist',
    href: '/waitlist',
    icon: '⏱️',
    roles: ['owner', 'assistant']
  },
  {
    label: 'Copilot',
    href: '/copilot',
    icon: '🤖',
    roles: ['owner', 'dentist']
  },
  {
    label: 'Paramètres',
    href: '/settings/profile',
    icon: '⚙️',
    roles: ['owner', 'dentist', 'assistant']
  }
]

interface AppShellProps {
  children: ReactNode
  user: UserProfile
  cabinetName: string
}

export function AppShell({ children, user, cabinetName }: AppShellProps) {
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const filteredNav = navigation.filter(item =>
    item.roles.includes(user.role)
  )

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen flex bg-[#F4F6FB]">
      {/* Sidebar Desktop */}
      <aside className="w-64 hidden lg:flex flex-col border-r bg-white">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="font-semibold text-gray-900">Dentismart</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Cabinet info */}
        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 mb-1">Cabinet</div>
          <div className="text-sm font-medium text-gray-900 truncate">{cabinetName}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white/80 backdrop-blur">
          {/* Left: Mobile menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="text-sm text-gray-600">
              {pathname.split('/').filter(Boolean).join(' / ')}
            </div>
          </div>

          {/* Right: Search + Language + Profile */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block">
              <input
                type="search"
                placeholder="Rechercher..."
                className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-64"
              />
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
                <span>🌐</span>
                <span className="hidden sm:inline">{user.locale?.split('-')[0].toUpperCase() || 'FR'}</span>
              </button>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-medium">
                    {getInitials(user.full_name)}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <div className="font-medium text-sm">{user.full_name || 'Utilisateur'}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                  <Link
                    href="/settings/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Mon profil
                  </Link>
                  {user.role === 'owner' && (
                    <Link
                      href="/settings/cabinet"
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Paramètres du cabinet
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="w-64 h-full bg-white" onClick={e => e.stopPropagation()}>
            <div className="h-16 flex items-center px-6 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
                  D
                </div>
                <span className="font-semibold text-gray-900">Dentismart</span>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {filteredNav.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
