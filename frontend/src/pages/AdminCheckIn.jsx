import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'

export default function AdminCheckIn({ onLogout }) {
  const { campId } = useCamp()
  const [checkInStatus, setCheckInStatus] = useState(null)
  const [pendingParticipants, setPendingParticipants] = useState([])
  const [checkedInParticipants, setCheckedInParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCheckInData()
  }, [])

  const loadCheckInData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await api.get(`/check-in/status?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCheckInStatus(response.data)

      if (response.data.pending_participants) {
        setPendingParticipants(response.data.pending_participants)
      }
      if (response.data.checked_in_participants) {
        setCheckedInParticipants(response.data.checked_in_participants)
      }
    } catch (err) {
      setError('Fehler beim Laden des Check-In Status')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (participantId, participantName) => {
    try {
      const token = localStorage.getItem('token')
      await api.post('/check-in/', {
        participant_id: participantId,
        camp_id: campId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSuccess(`✓ ${participantName} eingecheckt!`)
      setTimeout(() => setSuccess(''), 3000)
      loadCheckInData()
    } catch (err) {
      setError('Fehler beim Check-In')
      console.error('Error:', err)
    }
  }

  const getFilteredPending = () => {
    return pendingParticipants.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredPending = getFilteredPending()

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Check-In Daten werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-navy mb-2">✓ Check-In Management</h2>
          <p className="text-slate-600">Verwalten Sie die Ankunft der Teilnehmer</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">✓</span>
            <div>
              <p className="font-semibold">Erfolg</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        {checkInStatus && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Check-In Fortschritt</p>
                  <p className="text-2xl font-bold text-navy">
                    {checkInStatus.checked_in} von {checkInStatus.total} Teilnehmern
                  </p>
                </div>
                <p className="text-4xl font-bold text-gold">{checkInStatus.percentage}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${checkInStatus.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-sm text-slate-600 font-medium">✓ Angekommen</p>
                <p className="text-3xl font-bold text-green-600">{checkInStatus.checked_in || 0}</p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-600 font-medium">⏳ Ausstehend</p>
                <p className="text-3xl font-bold text-red-600">{checkInStatus.pending || 0}</p>
              </div>
              <div className="card">
                <p className="text-sm text-slate-600 font-medium">👥 Gesamt</p>
                <p className="text-3xl font-bold text-navy">{checkInStatus.total || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Participants */}
        {filteredPending.length > 0 ? (
          <div className="card">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Nach Name suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <h3 className="text-xl font-bold text-navy mb-4">
              ⏳ Noch nicht eingecheckt ({filteredPending.length})
            </h3>
            <div className="space-y-2">
              {filteredPending.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    {p.zelt && <p className="text-sm text-slate-600">{p.zelt}</p>}
                  </div>
                  <button
                    onClick={() => handleCheckIn(p.id, p.name)}
                    className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold text-sm whitespace-nowrap ml-4"
                  >
                    ✓ Check-In
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          <div className="card text-center py-12">
            <p className="text-slate-600">Keine Teilnehmer gefunden</p>
          </div>
        ) : (
          <div className="card bg-green-50 border border-green-200 p-8 text-center">
            <p className="text-2xl font-bold text-green-600 mb-2">✓ Alle eingecheckt!</p>
            <p className="text-slate-600">Alle {checkInStatus?.total || 0} Teilnehmer sind angekommen.</p>
          </div>
        )}

        {/* Checked In Participants */}
        {checkedInParticipants.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-4">✓ Eingecheckt ({checkedInParticipants.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {checkedInParticipants.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-600">
                      {p.check_in_time ? new Date(p.check_in_time).toLocaleTimeString('de-DE') : 'Zeit unbekannt'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    ✓ Eingecheckt
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
