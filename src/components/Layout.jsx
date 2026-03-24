import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [overdueContacts, setOverdueContacts] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    async function fetchNotifications() {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('follow_up_reminder_days, email_reminders_enabled')
        .eq('user_id', user.id)
        .single()

      const days = prefs?.follow_up_reminder_days ?? 14
      const enabled = prefs?.email_reminders_enabled ?? false
      setNotificationsEnabled(enabled)

      if (enabled) {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        const cutoffStr = cutoff.toISOString().split('T')[0]

        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, name, company, last_contact_date')
          .eq('user_id', user.id)
          .or(`last_contact_date.is.null,last_contact_date.lt.${cutoffStr}`)
          .order('last_contact_date', { ascending: true })
          .limit(10)

        setOverdueContacts(contacts || [])
      } else {
        setOverdueContacts([])
      }
    }

    fetchNotifications()
  }, [user.id])

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function formatDate(dateStr) {
    if (!dateStr) return 'Never contacted'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-lg font-semibold tracking-tight text-gray-900 hover:text-gray-600 transition-colors">JobTrackr</Link>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <NavLink
                  to="/applications"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`
                  }
                >
                  Applications
                </NavLink>
                <NavLink
                  to="/network"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`
                  }
                >
                  Network
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`
                  }
                >
                  Settings
                </NavLink>
              </nav>

              {/* Notification Bell */}
              {notificationsEnabled && (
                <div className="relative" ref={bellRef}>
                  <button
                    onClick={() => setBellOpen(o => !o)}
                    className="relative p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    aria-label="Follow-up reminders"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {overdueContacts.length > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                        {overdueContacts.length}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Follow-up Reminders</span>
                        {overdueContacts.length > 0 && (
                          <span className="text-xs font-medium text-red-500">{overdueContacts.length} overdue</span>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {overdueContacts.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-gray-500 text-center">All contacts are up to date!</p>
                        ) : (
                          overdueContacts.map(contact => (
                            <button
                              key={contact.id}
                              onClick={() => {
                                navigate(`/network?highlight=${contact.id}`)
                                setBellOpen(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {contact.company && <span>{contact.company} · </span>}
                                {formatDate(contact.last_contact_date)}
                              </p>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-2.5 border-t border-gray-100">
                        <button
                          onClick={() => { navigate('/settings'); setBellOpen(false) }}
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          Manage in Settings
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-500">{user?.email?.split('@')[0]}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
