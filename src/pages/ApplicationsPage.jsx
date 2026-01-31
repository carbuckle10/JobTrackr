import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AddApplicationModal from '../components/AddApplicationModal'
import ApplicationCard from '../components/ApplicationCard'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setApplications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [])

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
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
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
