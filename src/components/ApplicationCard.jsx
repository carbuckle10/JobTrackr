import { useState } from 'react'

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Denied: 'bg-red-100 text-red-800'
}

const stageColors = {
  'Applied': 'text-gray-600',
  'Phone Screen': 'text-blue-600',
  'Interview': 'text-purple-600',
  'Final Round': 'text-orange-600',
  'Offer': 'text-green-600'
}

export default function ApplicationCard({ application }) {
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
            <h3 className="font-semibold text-gray-900">{application.company}</h3>
            {application.position && (
              <p className="text-sm text-gray-600">{application.position}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {application.status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                {application.status}
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

        <div className="flex items-center space-x-4 mt-2 text-sm">
          {application.interview_stage && (
            <span className={`font-medium ${stageColors[application.interview_stage] || 'text-gray-600'}`}>
              {application.interview_stage}
            </span>
          )}
          {application.date_applied && (
            <span className="text-gray-500">
              Applied: {formatDate(application.date_applied)}
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {application.connection && (
              <div>
                <span className="text-gray-500">Connection:</span> {application.connection}
              </div>
            )}
            {application.date_responded && (
              <div>
                <span className="text-gray-500">Responded:</span> {formatDate(application.date_responded)}
              </div>
            )}
            {application.num_interviews !== null && application.num_interviews !== undefined && (
              <div>
                <span className="text-gray-500"># Interviews:</span> {application.num_interviews}
              </div>
            )}
          </div>

          {application.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Notes:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
