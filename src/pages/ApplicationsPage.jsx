import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AddApplicationModal from '../components/AddApplicationModal'
import ApplicationCard from '../components/ApplicationCard'

const STATUS_TABS = ['All', 'Pending', 'Accepted', 'Denied']

const STAGE_TABS = ['Applied', 'Phone Screen', 'Interview', 'Final Round', 'Offer']

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [activeStage, setActiveStage] = useState(null)

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
    const matchesSearch = !query || (
      app.company?.toLowerCase().includes(query) ||
      app.position?.toLowerCase().includes(query) ||
      app.notes?.toLowerCase().includes(query) ||
      app.application_contacts?.some(ac =>
        ac.contact?.name?.toLowerCase().includes(query) ||
        ac.contact?.company?.toLowerCase().includes(query)
      )
    )
    const matchesStatus = activeStatus === 'All' || (app.status || 'Pending') === activeStatus
    const matchesStage = !activeStage || app.interview_stage === activeStage
    return matchesSearch && matchesStatus && matchesStage
  })

  const statusCounts = STATUS_TABS.reduce((acc, status) => {
    acc[status] = status === 'All'
      ? applications.length
      : applications.filter(a => (a.status || 'Pending') === status).length
    return acc
  }, {})

  const handleStatusTab = (status) => {
    setActiveStatus(status)
    setActiveStage(null)
  }

  const handleStageTab = (stage) => {
    setActiveStage(prev => prev === stage ? null : stage)
    setActiveStatus('All')
  }

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

      {!loading && applications.length > 0 && (
        <div className="mb-4 space-y-2">
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map(status => (
              <button
                key={status}
                onClick={() => handleStatusTab(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeStatus === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {status}
                <span className={`ml-1.5 text-xs ${activeStatus === status ? 'text-gray-300' : 'text-gray-400'}`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          {/* Stage chips */}
          <div className="flex gap-2 flex-wrap">
            {STAGE_TABS.map(stage => (
              <button
                key={stage}
                onClick={() => handleStageTab(stage)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeStage === stage
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <p className="text-gray-500 mb-4">No applications match your filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveStatus('All'); setActiveStage(null) }}
            className="text-gray-900 font-medium hover:underline"
          >
            Clear filters
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
