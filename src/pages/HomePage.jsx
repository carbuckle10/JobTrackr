import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getDeadlineUrgency, formatDeadlineDate } from '../lib/deadlineUtils'
import ApplicationVolumeChart from '../components/charts/ApplicationVolumeChart'
import StageDistributionChart from '../components/charts/StageDistributionChart'
import ResponseRateChart from '../components/charts/ResponseRateChart'

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    denied: 0
  })
  const [applications, setApplications] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [contactsToFollowUp, setContactsToFollowUp] = useState([])
  const [followUpDays, setFollowUpDays] = useState(14)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch user preferences for follow-up interval
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('follow_up_reminder_days')
        .eq('user_id', user.id)
        .single()

      const reminderDays = prefs?.follow_up_reminder_days ?? 14
      setFollowUpDays(reminderDays)

      // Fetch applications
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (apps) {
        setApplications(apps)
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === 'Pending').length,
          accepted: apps.filter(a => a.status === 'Accepted').length,
          denied: apps.filter(a => a.status === 'Denied').length
        })
        setRecentApplications(apps.slice(0, 5))

        // Upcoming deadlines: non-null deadlines sorted ascending, top 5
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const deadlines = apps
          .filter(a => a.deadline)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5)
        setUpcomingDeadlines(deadlines)
      }

      // Fetch contacts needing follow-up
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .order('last_contact_date', { ascending: true })

      if (contacts) {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - reminderDays)

        const needsFollowUp = contacts.filter(c => {
          if (!c.last_contact_date) return true
          return new Date(c.last_contact_date) < cutoff
        }).slice(0, 5)

        setContactsToFollowUp(needsFollowUp)
      }

      setLoading(false)
    }

    fetchData()
  }, [user.id])

  const responseRate = stats.total > 0
    ? Math.round(((stats.accepted + stats.denied) / stats.total) * 100)
    : 0

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <div className="flex space-x-3">
          <Link
            to="/applications"
            className="px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 shadow-sm"
          >
            + Add Application
          </Link>
          <Link
            to="/network"
            className="px-3.5 py-2 bg-white text-gray-900 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            + Add Contact
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-gray-400 pl-5 pr-4 py-4">
          <p className="text-xs font-medium text-gray-500">Total Apps</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-yellow-400 pl-5 pr-4 py-4">
          <p className="text-xs font-medium text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500 pl-5 pr-4 py-4">
          <p className="text-xs font-medium text-gray-500">Accepted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-400 pl-5 pr-4 py-4">
          <p className="text-xs font-medium text-gray-500">Denied</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.denied}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-400 pl-5 pr-4 py-4">
          <p className="text-xs font-medium text-gray-500">Response Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{responseRate}%</p>
        </div>
      </div>

      {/* Analytics Charts */}
      {applications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Analytics</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-3">Applications Over Time</p>
              <ApplicationVolumeChart applications={applications} />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-3">Stage Distribution</p>
              <StageDistributionChart applications={applications} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 mb-3">Weekly Response Rate</p>
            <ResponseRateChart applications={applications} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/applications" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500 text-sm">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map(app => (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{app.company}</p>
                    <p className="text-xs text-gray-500">{app.position || 'No position'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'Denied' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts to Follow Up */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Needs Follow-up</h3>
            <Link to="/network" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {contactsToFollowUp.length === 0 ? (
            <p className="text-gray-500 text-sm">All contacts are up to date!</p>
          ) : (
            <div className="space-y-3">
              {contactsToFollowUp.map(contact => (
                <div key={contact.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                    <p className="text-xs text-gray-500">
                      {contact.company || 'No company'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {contact.last_contact_date
                      ? `Last: ${formatDate(contact.last_contact_date)}`
                      : 'Never contacted'
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Deadlines</h3>
            <Link to="/applications" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map(app => {
              const urgency = getDeadlineUrgency(app.deadline)
              return (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{app.company}</p>
                    <p className="text-xs text-gray-500">{app.position || 'No position'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatDeadlineDate(app.deadline)}</p>
                    {urgency && (
                      <p className={`text-xs ${urgency.colorClass}`}>{urgency.label}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
