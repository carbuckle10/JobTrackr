import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AddContactModal from '../components/AddContactModal'
import ContactCard from '../components/ContactCard'

export default function NetworkPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      ) : (
        <div className="space-y-4">
          {contacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} onUpdate={fetchContacts} />
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
