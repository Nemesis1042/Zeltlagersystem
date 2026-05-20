import { useState, useEffect } from 'react'
import axios from 'axios'

export default function CheckInPage() {
  const [status, setStatus] = useState(null)
  const [participants, setParticipants] = useState([])
  const [filteredParticipants, setFilteredParticipants] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const CAMP_ID = 1
  const MA_USER_ID = 1 // Hardcoded for MVP, should come from auth

  useEffect(() => {
    loadStatus()
    loadParticipants()
  }, [])

  useEffect(() => {
    // Filter participants by search
    const filtered = participants.filter(p => {
      const name = `${p.name}`.toLowerCase()
      return name.includes(search.toLowerCase())
    })
    setFilteredParticipants(filtered)
  }, [search, participants])

  const loadStatus = async () => {
    try {
      const response = await axios.get(`/api/check-in/status/${CAMP_ID}`)
      setStatus(response.data)
    } catch (err) {
      console.error('Error loading check-in status:', err)
    }
  }

  const loadParticipants = async () => {
    try {
      const response = await axios.get(`/api/check-in/list/${CAMP_ID}`)
      setParticipants(response.data)
    } catch (err) {
      console.error('Error loading participants:', err)
    }
  }

  const handleCheckIn = async (participantId) => {
    setLoading(true)
    try {
      await axios.post(`/api/check-in/`, {
        participant_id: participantId,
        brought_by: null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setMessage('✓ Check-In erfolgreich!')
      setTimeout(() => setMessage(''), 2000)

      // Reload data
      await loadStatus()
      await loadParticipants()
    } catch (err) {
      setMessage('❌ Fehler beim Check-In')
      setTimeout(() => setMessage(''), 2000)
      console.error('Error during check-in:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!status) return <div className="text-center py-8">Loading...</div>

  const pending = filteredParticipants.filter(p => !p.checked_in)
  const completed = filteredParticipants.filter(p => p.checked_in)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-4">✓ Check-In System</h2>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <p className="text-green-600 text-sm font-medium">Angekommen</p>
          <p className="text-3xl font-bold text-green-700">{status.checked_in}/{status.total}</p>
          <p className="text-xs text-green-600 mt-1">{status.percentage}%</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 text-sm font-medium">Noch nicht da</p>
          <p className="text-3xl font-bold text-red-700">{status.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-600 text-sm font-medium">Fortschritt</p>
          <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${status.percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <p className="text-purple-600 text-sm font-medium">Total Teilnehmer</p>
          <p className="text-3xl font-bold text-purple-700">{status.total}</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.startsWith('✓')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="🔍 Teilnehmer suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Pending Participants */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-red-700">Noch nicht eingetroffen ({pending.length})</h3>
        {pending.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <p className="text-xl font-bold text-green-700">✓ Alle TN angekommen!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map(p => (
              <div
                key={p.id}
                className="bg-white border border-red-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-600">🏕️ {p.zelt}</p>
                </div>
                <button
                  onClick={() => handleCheckIn(p.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  ✓ Check-In
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Participants */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 text-green-700">Bereits angekommen ({completed.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {completed.map(p => (
              <div
                key={p.id}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <p className="font-medium text-green-800">✓ {p.name}</p>
                <p className="text-xs text-green-600 mt-1">
                  {new Date(p.check_in_time).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} Uhr
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
