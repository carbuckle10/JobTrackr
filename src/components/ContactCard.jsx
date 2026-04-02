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
  const [copiedField, setCopiedField] = useState(null)
  const [linkedApps, setLinkedApps] = useState([])
  const [linkedAppsLoading, setLinkedAppsLoading] = useState(false)
  const [linkedAppsExpanded, setLinkedAppsExpanded] = useState(false)
  const [formData, setFormData] = useState({
    name: contact.name || '',
    company: contact.company || '',
    position: contact.position || '',
    linkedin_url: contact.linkedin_url || '',
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

  const handleToggleLinkedApps = async () => {
    if (!linkedAppsExpanded && linkedApps.length === 0) {
      setLinkedAppsLoading(true)
      const { data } = await supabase
        .from('application_contacts')
        .select('application:application_id(id, company, position, status)')
        .eq('contact_id', contact.id)
      setLinkedApps(data?.map(d => d.application).filter(Boolean) || [])
      setLinkedAppsLoading(false)
    }
    setLinkedAppsExpanded(prev => !prev)
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
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
        linkedin_url: formData.linkedin_url || null,
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
      linkedin_url: contact.linkedin_url || '',
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

  const daysSince = contact.last_contact_date
    ? Math.floor((new Date() - new Date(contact.last_contact_date)) / 86400000)
    : null
  const daysBadgeClass = daysSince === null
    ? 'bg-gray-100 text-gray-500'
    : daysSince < 7
      ? 'bg-green-100 text-green-800'
      : daysSince < 14
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'
  const daysBadgeText = daysSince === null
    ? 'Never contacted'
    : daysSince === 0
      ? 'Today'
      : daysSince === 1
        ? '1 day ago'
        : `${daysSince} days ago`

  if (editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
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
            <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View LinkedIn profile"
                className="text-[#0A66C2] hover:opacity-75 transition-opacity flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
          {(contact.position || contact.company) && (
            <p className="text-sm text-gray-500">
              {contact.position}{contact.position && contact.company && ' at '}{contact.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${daysBadgeClass}`}>
            {daysBadgeText}
          </span>
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
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
          {contact.email ? (
            <div className="flex items-center gap-1">
              <a href={`mailto:${contact.email}`} className="text-sm font-medium text-blue-600 hover:underline truncate">
                {contact.email}
              </a>
              <button
                onClick={() => handleCopy(contact.email, 'email')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy email"
              >
                {copiedField === 'email' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">—</p>
          )}
        </div>
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
          {contact.phone ? (
            <div className="flex items-center gap-1">
              <a href={`tel:${contact.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                {contact.phone}
              </a>
              <button
                onClick={() => handleCopy(contact.phone, 'phone')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy phone"
              >
                {copiedField === 'phone' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">—</p>
          )}
        </div>
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Last Contact</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(contact.last_contact_date)}</p>
        </div>
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">School</p>
          <p className="text-sm font-medium text-gray-900 truncate">{contact.school || '—'}</p>
        </div>
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Major</p>
          <p className="text-sm font-medium text-gray-900 truncate">{contact.major || '—'}</p>
        </div>
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Grad Year</p>
          <p className="text-sm font-medium text-gray-900">{contact.grad_year || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
        <div className="bg-gray-50/60 rounded-md p-2.5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Chat Length</p>
          <p className="text-sm font-medium text-gray-900">{contact.chat_length || '—'}</p>
        </div>
        <div className="bg-gray-50/60 rounded-md p-2.5 md:col-span-5 col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Notes</p>
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

      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleToggleLinkedApps}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3 h-3 transition-transform ${linkedAppsExpanded ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Linked Applications
        </button>
        {linkedAppsExpanded && (
          <div className="mt-2">
            {linkedAppsLoading ? (
              <p className="text-xs text-gray-400">Loading...</p>
            ) : linkedApps.length === 0 ? (
              <p className="text-xs text-gray-400">No linked applications.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {linkedApps.map(app => (
                  <span
                    key={app.id}
                    className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-md"
                  >
                    <span className="font-medium">{app.company}</span>
                    {app.position && <span className="text-gray-400">· {app.position}</span>}
                    <span className={`font-medium ${
                      (app.status || 'Pending') === 'Accepted' ? 'text-green-600'
                      : (app.status || 'Pending') === 'Denied' ? 'text-red-600'
                      : 'text-yellow-600'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
