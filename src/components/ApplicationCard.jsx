import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Denied: 'bg-red-100 text-red-800'
}

const stageColors = {
  'Applied': 'bg-gray-100 text-gray-700',
  'Phone Screen': 'bg-blue-100 text-blue-700',
  'Interview': 'bg-purple-100 text-purple-700',
  'Final Round': 'bg-orange-100 text-orange-700',
  'Offer': 'bg-green-100 text-green-700'
}

export default function ApplicationCard({ application, onUpdate }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [contacts, setContacts] = useState([])
  const [selectedContactIds, setSelectedContactIds] = useState([])
  const [formData, setFormData] = useState({
    company: application.company || '',
    position: application.position || '',
    connection: application.connection || '',
    date_applied: application.date_applied || '',
    status: application.status || 'Pending',
    interview_stage: application.interview_stage || '',
    num_interviews: application.num_interviews ?? '',
    date_responded: application.date_responded || '',
    notes: application.notes || ''
  })

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  useEffect(() => {
    if (editing) {
      const fetchContactsAndLinks = async () => {
        const [contactsRes, linksRes] = await Promise.all([
          supabase.from('contacts').select('id, name, company').order('name', { ascending: true }),
          supabase.from('application_contacts').select('contact_id').eq('application_id', application.id)
        ])

        setContacts(contactsRes.data || [])
        setSelectedContactIds(linksRes.data?.map(l => l.contact_id) || [])
      }
      fetchContactsAndLinks()
    }
  }, [editing, application.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)

    // Update application fields
    const { error: appError } = await supabase
      .from('applications')
      .update({
        company: formData.company,
        position: formData.position || null,
        connection: formData.connection || null,
        date_applied: formData.date_applied || null,
        status: formData.status,
        interview_stage: formData.interview_stage || null,
        num_interviews: formData.num_interviews ? parseInt(formData.num_interviews) : null,
        date_responded: formData.date_responded || null,
        notes: formData.notes || null
      })
      .eq('id', application.id)

    if (appError) {
      setSaving(false)
      return
    }

    // Sync contact relationships
    await supabase.from('application_contacts').delete().eq('application_id', application.id)

    if (selectedContactIds.length > 0) {
      await supabase.from('application_contacts').insert(
        selectedContactIds.map(contact_id => ({
          application_id: application.id,
          contact_id
        }))
      )
    }

    setSaving(false)
    setEditing(false)
    onUpdate()
  }

  const handleCancel = () => {
    setFormData({
      company: application.company || '',
      position: application.position || '',
      connection: application.connection || '',
      date_applied: application.date_applied || '',
      status: application.status || 'Pending',
      interview_stage: application.interview_stage || '',
      num_interviews: application.num_interviews ?? '',
      date_responded: application.date_responded || '',
      notes: application.notes || ''
    })
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return

    await supabase
      .from('applications')
      .delete()
      .eq('id', application.id)

    onUpdate()
  }

  const notesText = application.notes || 'No notes'
  const isLongNotes = notesText.length > 50

  if (editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contacts</label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
              {contacts.length === 0 ? (
                <p className="text-xs text-gray-400">No contacts available</p>
              ) : (
                <div className="space-y-1.5">
                  {contacts.map(contact => (
                    <label key={contact.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={(e) => {
                          setSelectedContactIds(prev =>
                            e.target.checked ? [...prev, contact.id] : prev.filter(id => id !== contact.id)
                          )
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Connection Notes</label>
            <input
              type="text"
              name="connection"
              value={formData.connection}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date Applied</label>
            <input
              type="date"
              name="date_applied"
              value={formData.date_applied}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Denied">Denied</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Interview Stage</label>
            <select
              name="interview_stage"
              value={formData.interview_stage}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
            <label className="block text-xs font-medium text-gray-500 mb-1"># Interviews</label>
            <input
              type="number"
              name="num_interviews"
              value={formData.num_interviews}
              onChange={handleChange}
              min="0"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date Responded</label>
            <input
              type="date"
              name="date_responded"
              value={formData.date_responded}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Add notes..."
          />
        </div>

        <div className="mt-3 flex justify-between items-center">
          {formData.date_responded && (
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, date_responded: '' }))}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Set to "Response pending"
            </button>
          )}
          <div className="flex space-x-2 ml-auto">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{application.company}</h3>
          {application.position && (
            <p className="text-sm text-gray-600">{application.position}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {application.interview_stage && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${stageColors[application.interview_stage] || 'bg-gray-100 text-gray-700'}`}>
              {application.interview_stage}
            </span>
          )}
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
            {application.status || 'Pending'}
          </span>
          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-2 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Applied</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(application.date_applied)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Responded</p>
          <p className={`text-sm font-medium ${application.date_responded ? 'text-gray-900' : 'text-yellow-600'}`}>
            {application.date_responded ? formatDate(application.date_responded) : 'Pending'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1"># Interviews</p>
          <p className="text-sm font-medium text-gray-900">{application.num_interviews ?? 0}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Contacts</p>
          {application.application_contacts?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {application.application_contacts.map(({ contact }) => (
                <button
                  key={contact.id}
                  onClick={() => navigate(`/network?highlight=${contact.id}`)}
                  className="inline-flex items-center gap-1 text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors"
                >
                  <span className="font-medium">{contact.name}</span>
                  {contact.company && <span className="text-gray-500">• {contact.company}</span>}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">—</p>
          )}
        </div>
        {application.connection && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Connection Notes</p>
            <p className="text-sm font-medium text-gray-900 truncate">{application.connection}</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-3 md:col-span-1 col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            {isLongNotes && (
              <button
                onClick={() => setNotesExpanded(!notesExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {notesExpanded ? 'Less' : 'More'}
              </button>
            )}
          </div>
          <p className={`text-sm text-gray-700 ${!notesExpanded ? 'truncate' : ''}`}>
            {notesExpanded ? notesText : (isLongNotes ? notesText.substring(0, 30) + '...' : notesText)}
          </p>
        </div>
      </div>
    </div>
  )
}
