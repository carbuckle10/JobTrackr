import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AddContactModal from '../components/AddContactModal'
import ContactCard from '../components/ContactCard'

export default function NetworkPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
    const matchesName = contact.name?.toLowerCase().includes(query)
    const matchesCompany = contact.company?.toLowerCase().includes(query)
    const matchesPosition = contact.position?.toLowerCase().includes(query)
    const matchesSchool = contact.school?.toLowerCase().includes(query)
    const matchesEmail = contact.email?.toLowerCase().includes(query)
    return matchesName || matchesCompany || matchesPosition || matchesSchool || matchesEmail
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Network</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          + Add Contact
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts by name, company, position, school, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

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
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No contacts match your search.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-gray-900 font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map(contact => (
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
