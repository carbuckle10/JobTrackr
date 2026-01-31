import { useState } from 'react'

const statusColors = {
  Lead: 'bg-yellow-100 text-yellow-800',
  Connected: 'bg-blue-100 text-blue-800',
  Close: 'bg-green-100 text-green-800',
  Mentor: 'bg-purple-100 text-purple-800'
}

const feelColors = {
  Great: 'text-green-600',
  Good: 'text-blue-600',
  Okay: 'text-yellow-600',
  Cold: 'text-gray-500'
}

export default function ContactCard({ contact }) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            {contact.position && contact.company && (
              <p className="text-sm text-gray-600">
                {contact.position} at {contact.company}
              </p>
            )}
            {!contact.position && contact.company && (
              <p className="text-sm text-gray-600">{contact.company}</p>
            )}
            {contact.position && !contact.company && (
              <p className="text-sm text-gray-600">{contact.position}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {contact.relationship_status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[contact.relationship_status] || 'bg-gray-100 text-gray-800'}`}>
                {contact.relationship_status}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {contact.last_contact_date && (
          <p className="text-xs text-gray-500 mt-2">
            Last contact: {formatDate(contact.last_contact_date)}
          </p>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {contact.email && (
              <div>
                <span className="text-gray-500">Email:</span>{' '}
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div>
                <span className="text-gray-500">Phone:</span>{' '}
                <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.school && (
              <div>
                <span className="text-gray-500">School:</span> {contact.school}
              </div>
            )}
            {contact.major && (
              <div>
                <span className="text-gray-500">Major:</span> {contact.major}
              </div>
            )}
            {contact.grad_year && (
              <div>
                <span className="text-gray-500">Grad Year:</span> {contact.grad_year}
              </div>
            )}
            {contact.chat_length && (
              <div>
                <span className="text-gray-500">Chat Length:</span> {contact.chat_length}
              </div>
            )}
            {contact.chat_feel && (
              <div>
                <span className="text-gray-500">Chat Feel:</span>{' '}
                <span className={feelColors[contact.chat_feel] || 'text-gray-900'}>
                  {contact.chat_feel}
                </span>
              </div>
            )}
          </div>

          {contact.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Notes:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
