import { useState } from 'react'
import { supabase } from '../lib/supabase'

const statusColors = {
  Lead: 'bg-yellow-100 text-yellow-800',
  Connected: 'bg-blue-100 text-blue-800',
  Close: 'bg-green-100 text-green-800',
  Mentor: 'bg-purple-100 text-purple-800'
}

const feelColors = {
  Great: 'bg-green-100 text-green-700',
  Good: 'bg-blue-100 text-blue-700',
  Okay: 'bg-yellow-100 text-yellow-700',
  Cold: 'bg-gray-100 text-gray-700'
}

export default function ContactCard({ contact, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [formData, setFormData] = useState({
    name: contact.name || '',
    company: contact.company || '',
    position: contact.position || '',
    school: contact.school || '',
    major: contact.major || '',
    grad_year: contact.grad_year ?? '',
    email: contact.email || '',
    phone: contact.phone || '',
    last_contact_date: contact.last_contact_date || '',
    chat_length: contact.chat_length || '',
    chat_feel: contact.chat_feel || '',
    relationship_status: contact.relationship_status || '',
    notes: contact.notes || ''
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
      .from('contacts')
      .update({
        name: formData.name,
        company: formData.company || null,
        position: formData.position || null,
        school: formData.school || null,
        major: formData.major || null,
        grad_year: formData.grad_year ? parseInt(formData.grad_year) : null,
        email: formData.email || null,
        phone: formData.phone || null,
        last_contact_date: formData.last_contact_date || null,
        chat_length: formData.chat_length || null,
        chat_feel: formData.chat_feel || null,
        relationship_status: formData.relationship_status || null,
        notes: formData.notes || null
      })
      .eq('id', contact.id)

    setSaving(false)
    if (!error) {
      setEditing(false)
      onUpdate()
    }
  }

  const handleCancel = () => {
    setFormData({
      name: contact.name || '',
      company: contact.company || '',
      position: contact.position || '',
      school: contact.school || '',
      major: contact.major || '',
      grad_year: contact.grad_year ?? '',
      email: contact.email || '',
      phone: contact.phone || '',
      last_contact_date: contact.last_contact_date || '',
      chat_length: contact.chat_length || '',
      chat_feel: contact.chat_feel || '',
      relationship_status: contact.relationship_status || '',
      notes: contact.notes || ''
    })
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    await supabase
      .from('contacts')
      .delete()
      .eq('id', contact.id)

    onUpdate()
  }

  const notesText = contact.notes || 'No notes'
  const isLongNotes = notesText.length > 50

  if (editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Relationship</label>
            <select
              name="relationship_status"
              value={formData.relationship_status}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select...</option>
              <option value="Lead">Lead</option>
              <option value="Connected">Connected</option>
              <option value="Close">Close</option>
              <option value="Mentor">Mentor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">School</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Major</label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Grad Year</label>
            <input
              type="number"
              name="grad_year"
              value={formData.grad_year}
              onChange={handleChange}
              min="1950"
              max="2030"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Last Contact</label>
            <input
              type="date"
              name="last_contact_date"
              value={formData.last_contact_date}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Chat Length</label>
            <input
              type="text"
              name="chat_length"
              value={formData.chat_length}
              onChange={handleChange}
              placeholder="e.g., 30 min"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Chat Feel</label>
            <select
              name="chat_feel"
              value={formData.chat_feel}
              onChange={handleChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select...</option>
              <option value="Great">Great</option>
              <option value="Good">Good</option>
              <option value="Okay">Okay</option>
              <option value="Cold">Cold</option>
            </select>
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

        <div className="mt-3 flex justify-end space-x-2">
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
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
          {(contact.position || contact.company) && (
            <p className="text-sm text-gray-600">
              {contact.position}{contact.position && contact.company && ' at '}{contact.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {contact.chat_feel && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${feelColors[contact.chat_feel] || 'bg-gray-100 text-gray-700'}`}>
              {contact.chat_feel}
            </span>
          )}
          {contact.relationship_status && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[contact.relationship_status] || 'bg-gray-100 text-gray-800'}`}>
              {contact.relationship_status}
            </span>
          )}
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

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Email</p>
          {contact.email ? (
            <a href={`mailto:${contact.email}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
              {contact.email}
            </a>
          ) : (
            <p className="text-sm font-medium text-gray-900">—</p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Phone</p>
          {contact.phone ? (
            <a href={`tel:${contact.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
              {contact.phone}
            </a>
          ) : (
            <p className="text-sm font-medium text-gray-900">—</p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Last Contact</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(contact.last_contact_date)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">School</p>
          <p className="text-sm font-medium text-gray-900 truncate">{contact.school || '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Major</p>
          <p className="text-sm font-medium text-gray-900 truncate">{contact.major || '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Grad Year</p>
          <p className="text-sm font-medium text-gray-900">{contact.grad_year || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Chat Length</p>
          <p className="text-sm font-medium text-gray-900">{contact.chat_length || '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 md:col-span-5 col-span-1">
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
            {notesExpanded ? notesText : (isLongNotes ? notesText.substring(0, 80) + '...' : notesText)}
          </p>
        </div>
      </div>
    </div>
  )
}
