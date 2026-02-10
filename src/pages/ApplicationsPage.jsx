import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AddApplicationModal from '../components/AddApplicationModal'
import ApplicationCard from '../components/ApplicationCard'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        application_contacts (
          contact:contact_id (
            id,
            name,
            company,
            position,
            email,
            phone
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (!error) {
      setApplications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApplications = applications.filter(app => {
    const query = searchQuery.toLowerCase()
    const matchesCompany = app.company?.toLowerCase().includes(query)
    const matchesPosition = app.position?.toLowerCase().includes(query)
    const matchesNotes = app.notes?.toLowerCase().includes(query)
    const matchesContact = app.application_contacts?.some(ac =>
      ac.contact?.name?.toLowerCase().includes(query) ||
      ac.contact?.company?.toLowerCase().includes(query)
    )
    return matchesCompany || matchesPosition || matchesNotes || matchesContact
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          + Add Application
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search applications by company, position, contact, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No applications yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-900 font-medium hover:underline"
          >
            Add your first application
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No applications match your search.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-gray-900 font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(application => (
            <ApplicationCard key={application.id} application={application} onUpdate={fetchApplications} />
          ))}
        </div>
      )}

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplicationAdded={fetchApplications}
      />
    </div>
  )
}
