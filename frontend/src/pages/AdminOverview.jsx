import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'

export default function AdminOverview({ onLogout }) {
  const { campId } = useCamp()
  const [participants, setParticipants] = useState([])
  const [checkInStatus, setCheckInStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const partResponse = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(Array.isArray(partResponse.data) ? partResponse.data : [])

      const checkResponse = await api.get(`/check-in/status?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCheckInStatus(checkResponse.data)
    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Daten werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {checkInStatus && (
            <>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✓</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Angekommen</p>
                    <p className="text-3xl font-bold text-green-600">{checkInStatus.checked_in || 0}</p>
                    <p className="text-xs text-slate-500">{checkInStatus.percentage || 0}%</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⏳</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Fehlen noch</p>
                    <p className="text-3xl font-bold text-red-600">{checkInStatus.pending || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">👥</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Gesamt</p>
                    <p className="text-3xl font-bold text-navy">{participants.length}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏕️</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Status</p>
                    <p className="text-xl font-bold text-green-600">✓ Online</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {checkInStatus && checkInStatus.percentage && (
          <div className="card">
            <p className="text-sm font-semibold text-slate-600 mb-3">Check-In Fortschritt</p>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${checkInStatus.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {checkInStatus.checked_in} von {checkInStatus.total} Teilnehmern ({checkInStatus.percentage}%)
            </p>
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-bold text-navy mb-4">📋 Schnelle Aktionen</h3>
            <div className="space-y-2">
              <a href="/admin/check-in" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium text-navy">
                ✓ Check-In abschließen
              </a>
              <a href="/admin/tents" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium text-navy">
                ⛺ Zelte zuweisen
              </a>
              <a href="/admin/activities" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium text-navy">
                🎯 Aktivitäten erstellen
              </a>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-navy mb-4">⚙️ System Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">API Status:</span>
                <span className="font-semibold text-green-600">✓ Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Letztes Update:</span>
                <span className="font-semibold">{new Date().toLocaleTimeString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Version:</span>
                <span className="font-semibold">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
