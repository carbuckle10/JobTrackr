import { useState } from 'react'
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
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
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

    setSaving(false)
    if (!error) {
      setEditing(false)
      onUpdate()
    }
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Connection</label>
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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{application.company}</h3>
              {application.position && (
                <p className="text-sm text-gray-600">{application.position}</p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                {application.interview_stage && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColors[application.interview_stage] || 'bg-gray-100 text-gray-700'}`}>
                    {application.interview_stage}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                  {application.status || 'Pending'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-xs text-gray-500">Applied:</span>{' '}
              <span className="text-gray-900">{formatDate(application.date_applied)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Responded:</span>{' '}
              <span className={application.date_responded ? 'text-gray-900' : 'text-yellow-600'}>
                {application.date_responded ? formatDate(application.date_responded) : 'Response pending'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500"># Interviews:</span>{' '}
              <span className="text-gray-900">{application.num_interviews ?? 0}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Connection:</span>{' '}
              <span className="text-gray-900">{application.connection || '—'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">Notes:</span>{' '}
              <span className={`text-gray-700 ml-1 ${!notesExpanded && isLongNotes ? 'truncate max-w-[200px]' : ''}`}>
                {notesExpanded ? notesText : (isLongNotes ? notesText.substring(0, 50) + '...' : notesText)}
              </span>
              {isLongNotes && (
                <button
                  onClick={() => setNotesExpanded(!notesExpanded)}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {notesExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
