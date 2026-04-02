import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AddContactModal from '../components/AddContactModal'
import ContactCard from '../components/ContactCard'

const escapeCSV = (val) => {
  if (val === null || val === undefined) return ''
  const str = String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

export default function NetworkPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [followUpFilter, setFollowUpFilter] = useState(false)
  const [reminderDays, setReminderDays] = useState(14)
  const [sortBy, setSortBy] = useState('newest')
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightedContactId = searchParams.get('highlight')
  const contactRefs = useRef({})

  const fetchContacts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setContacts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContacts()
    supabase
      .from('user_preferences')
      .select('follow_up_reminder_days')
      .single()
      .then(({ data }) => {
        if (data?.follow_up_reminder_days) setReminderDays(data.follow_up_reminder_days)
      })
  }, [])

  useEffect(() => {
    if (highlightedContactId && contactRefs.current[highlightedContactId]) {
      setTimeout(() => {
        contactRefs.current[highlightedContactId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)

      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [highlightedContactId, contacts, setSearchParams])

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query || (
      contact.name?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query) ||
      contact.position?.toLowerCase().includes(query) ||
      contact.school?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    )
    const matchesFollowUp = !followUpFilter || (() => {
      if (!contact.last_contact_date) return true
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - reminderDays)
      return new Date(contact.last_contact_date) < cutoff
    })()
    return matchesSearch && matchesFollowUp
  })

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'last_contact':
        if (!a.last_contact_date && !b.last_contact_date) return 0
        if (!a.last_contact_date) return -1
        if (!b.last_contact_date) return 1
        return new Date(a.last_contact_date) - new Date(b.last_contact_date)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  const needsFollowUpCount = contacts.filter(c => {
    if (!c.last_contact_date) return true
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - reminderDays)
    return new Date(c.last_contact_date) < cutoff
  }).length

  const exportCSV = () => {
    const headers = ['Name', 'Company', 'Position', 'Email', 'Phone', 'LinkedIn', 'Relationship', 'Last Contact', 'School', 'Major', 'Grad Year', 'Chat Feel', 'Notes']
    const rows = sortedContacts.map(c => [
      c.name, c.company, c.position, c.email, c.phone, c.linkedin_url,
      c.relationship_status, c.last_contact_date, c.school, c.major, c.grad_year, c.chat_feel, c.notes
    ].map(escapeCSV))

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Network</h2>
        <div className="flex items-center gap-2">
          {contacts.length > 0 && (
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Export CSV
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 shadow-sm"
          >
            + Add Contact
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts by name, company, position, school, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
        />
      </div>

      {!loading && contacts.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFollowUpFilter(false)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !followUpFilter
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              All
              <span className={`ml-1.5 text-xs ${!followUpFilter ? 'text-gray-300' : 'text-gray-400'}`}>
                {contacts.length}
              </span>
            </button>
            <button
              onClick={() => setFollowUpFilter(true)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                followUpFilter
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              Needs Follow-up
              <span className={`ml-1.5 text-xs ${followUpFilter ? 'text-gray-300' : 'text-gray-400'}`}>
                {needsFollowUpCount}
              </span>
            </button>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="newest">Sort: Recently added</option>
            <option value="name">Sort: Name A–Z</option>
            <option value="last_contact">Sort: Last contacted</option>
          </select>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No contacts yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-900 font-medium hover:underline"
          >
            Add your first contact
          </button>
        </div>
      ) : sortedContacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No contacts match your filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setFollowUpFilter(false) }}
            className="text-gray-900 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedContacts.map(contact => (
            <div
              key={contact.id}
              ref={el => contactRefs.current[contact.id] = el}
              className={highlightedContactId === contact.id ? 'highlight-flash' : ''}
            >
              <ContactCard contact={contact} onUpdate={fetchContacts} />
            </div>
          ))}
        </div>
      )}

      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactAdded={fetchContacts}
      />
    </div>
  )
}
