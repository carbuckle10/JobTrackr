import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    denied: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [contactsToFollowUp, setContactsToFollowUp] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch applications
      const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (applications) {
        setStats({
          total: applications.length,
          pending: applications.filter(a => a.status === 'Pending').length,
          accepted: applications.filter(a => a.status === 'Accepted').length,
          denied: applications.filter(a => a.status === 'Denied').length
        })
        setRecentApplications(applications.slice(0, 5))
      }

      // Fetch contacts needing follow-up (no contact in 14+ days)
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .order('last_contact_date', { ascending: true })

      if (contacts) {
        const fourteenDaysAgo = new Date()
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

        const needsFollowUp = contacts.filter(c => {
          if (!c.last_contact_date) return true
          return new Date(c.last_contact_date) < fourteenDaysAgo
        }).slice(0, 5)

        setContactsToFollowUp(needsFollowUp)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

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
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex space-x-3">
          <Link
            to="/applications"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
          >
            + Add Application
          </Link>
          <Link
            to="/network"
            className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
          >
            + Add Contact
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Apps</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Accepted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Denied</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.denied}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Response Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{responseRate}%</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
    </div>
  )
}
