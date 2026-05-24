import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import StaffLayout from '../components/StaffLayout'

export default function StaffCheckIn({ onLogout }) {
  const { campId } = useCamp()
  const [checkInStatus, setCheckInStatus] = useState(null)
  const [pendingParticipants, setPendingParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    } catch (err) {
      setError('Fehler beim Laden des Check-In Status')
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
    }
  }

  if (loading) {
    return (
      <StaffLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Check-In Daten werden geladen...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2">✓ Check-In</h2>
          <p className="text-slate-600">Führen Sie Check-Ins durch</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <span>⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
            <span>✓</span>
            <div>
              <p className="font-semibold">Erfolg</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        {checkInStatus && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 font-medium">Check-In Fortschritt</p>
                <p className="text-2xl font-bold text-blue-600">{checkInStatus.checked_in}/{checkInStatus.total}</p>
              </div>
              <p className="text-4xl font-bold text-yellow-500">{checkInStatus.percentage}%</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${checkInStatus.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Pending List */}
        {pendingParticipants.length > 0 ? (
          <div className="card">
            <h3 className="text-xl font-bold text-blue-600 mb-4">⏳ Noch nicht eingecheckt</h3>
            <div className="space-y-2">
              {pendingParticipants.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    {p.zelt && <p className="text-sm text-slate-600">{p.zelt}</p>}
                  </div>
                  <button
                    onClick={() => handleCheckIn(p.id, p.name)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                  >
                    ✓ Check-In
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card bg-green-50 border border-green-200 p-8 text-center">
            <p className="text-2xl font-bold text-green-600">✓ Alle eingecheckt!</p>
          </div>
        )}
      </div>
    </StaffLayout>
  )
}
