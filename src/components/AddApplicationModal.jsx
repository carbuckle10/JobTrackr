import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function AddApplicationModal({ isOpen, onClose, onApplicationAdded }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contacts, setContacts] = useState([])
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    selectedContactIds: [],
    connection: '',
    date_applied: '',
    date_responded: '',
    interview_stage: '',
    num_interviews: '',
    status: 'Pending',
    notes: ''
  })

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('id, name, company, position')
        .order('name', { ascending: true })

      if (data) {
        setContacts(data)
      }
    }

    if (isOpen) {
      fetchContacts()
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Insert application
    const { data: newApp, error: appError } = await supabase.from('applications').insert({
      user_id: user.id,
      company: formData.company,
      position: formData.position || null,
      connection: formData.connection || null,
      date_applied: formData.date_applied || null,
      date_responded: formData.date_responded || null,
      interview_stage: formData.interview_stage || null,
      num_interviews: formData.num_interviews ? parseInt(formData.num_interviews) : null,
      status: formData.status || null,
      notes: formData.notes || null
    }).select().single()

    if (appError) {
      setError(appError.message)
      setLoading(false)
      return
    }

    // Insert contact links if any selected
    if (formData.selectedContactIds.length > 0) {
      await supabase.from('application_contacts').insert(
        formData.selectedContactIds.map(contact_id => ({
          application_id: newApp.id,
          contact_id
        }))
      )
    }

    setLoading(false)
    setFormData({
      company: '', position: '', selectedContactIds: [], connection: '', date_applied: '',
      date_responded: '', interview_stage: '', num_interviews: '',
      status: 'Pending', notes: ''
    })
    onApplicationAdded()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Application</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacts from Network
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                {contacts.length === 0 ? (
                  <p className="text-xs text-gray-400">No contacts available</p>
                ) : (
                  <div className="space-y-1.5">
                    {contacts.map(contact => (
                      <label key={contact.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.selectedContactIds.includes(contact.id)}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              selectedContactIds: e.target.checked
                                ? [...prev.selectedContactIds, contact.id]
                                : prev.selectedContactIds.filter(id => id !== contact.id)
                            }))
                          }}
                          className="w-4 h-4 text-gray-900 rounded"
                        />
                        <span className="truncate">
                          {contact.name}
                          {contact.company && <span className="text-gray-500"> ({contact.company})</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Notes
              </label>
              <input
                type="text"
                name="connection"
                value={formData.connection}
                onChange={handleChange}
                placeholder="e.g., Met at career fair, Alumni connection"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Denied">Denied</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Applied
              </label>
              <input
                type="date"
                name="date_applied"
                value={formData.date_applied}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Responded
              </label>
              <input
                type="date"
                name="date_responded"
                value={formData.date_responded}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Stage
              </label>
              <select
                name="interview_stage"
                value={formData.interview_stage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="Applied">Applied</option>
                <option value="Phone Screen">Phone Screen</option>
                <option value="Interview">Interview</option>
                <option value="Final Round">Final Round</option>
                <option value="Offer">Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                # of Interviews
              </label>
              <input
                type="number"
                name="num_interviews"
                value={formData.num_interviews}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Add any notes about this application..."
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
