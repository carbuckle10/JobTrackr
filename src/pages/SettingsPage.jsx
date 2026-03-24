import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [prefs, setPrefs] = useState({
    email_reminders_enabled: false,
    follow_up_reminder_days: 14
  })

  useEffect(() => {
    async function fetchPrefs() {
      const { data } = await supabase
        .from('user_preferences')
        .select('email_reminders_enabled, follow_up_reminder_days')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPrefs({
          email_reminders_enabled: data.email_reminders_enabled,
          follow_up_reminder_days: data.follow_up_reminder_days
        })
      }
      setLoading(false)
    }

    fetchPrefs()
  }, [user.id])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        email_reminders_enabled: prefs.email_reminders_enabled,
        follow_up_reminder_days: Math.max(1, Math.min(90, parseInt(prefs.follow_up_reminder_days) || 14))
      }, { onConflict: 'user_id' })

    setSaving(false)
    if (error) {
      setSaveError(error.message)
      console.error('Save error:', error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDeleting(true)
    setDeleteError(null)
    const { error } = await deleteAccount()
    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
    } else {
      navigate('/login')
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading settings...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your preferences for JobTrackr</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Follow-up Reminders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Follow-up Reminders</h3>
          <p className="text-sm text-gray-500 mb-5">
            Show a bell icon in the nav with contacts you haven't reached out to in a while.
          </p>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Show notification bell for overdue contacts</p>
                <p className="text-xs text-gray-500 mt-0.5">Displays a bell in the header when contacts need follow-up</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({ ...p, email_reminders_enabled: !p.email_reminders_enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  prefs.email_reminders_enabled ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    prefs.email_reminders_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Remind me after
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={prefs.follow_up_reminder_days}
                  onChange={(e) => setPrefs(p => ({ ...p, follow_up_reminder_days: e.target.value }))}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-600">days without contact</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Contacts last reached more than this many days ago will appear in the notification bell and dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Account</h3>
          <p className="text-sm text-gray-500 mb-4">Your account details</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">Email address</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Saved!</span>
          )}
          {saveError && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="font-semibold text-red-600 mb-1">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null) }}
            className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-md border border-red-300 hover:bg-red-50 shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete your account?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete all your applications, contacts, and settings.
              <span className="font-medium text-gray-900"> This action cannot be undone.</span>
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              autoFocus
            />
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
