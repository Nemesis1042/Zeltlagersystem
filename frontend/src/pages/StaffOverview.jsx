import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import StaffLayout from '../components/StaffLayout'

export default function StaffOverview({ onLogout }) {
  const { campId } = useCamp()
  const [stats, setStats] = useState(null)
  const [participants, setParticipants] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Load check-in status
      const statusResponse = await api.get(`/check-in/status?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setStats(statusResponse.data)

      // Load participants
      const partResponse = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(Array.isArray(partResponse.data) ? partResponse.data : [])

      // Load activities
      const actResponse = await api.get(`/activities/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setActivities(Array.isArray(actResponse.data) ? actResponse.data : [])
    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StaffLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Daten werden geladen...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout onLogout={onLogout}>
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

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats && (
            <>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✓</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Angekommen</p>
                    <p className="text-3xl font-bold text-green-600">{stats.checked_in || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⏳</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Fehlen noch</p>
                    <p className="text-3xl font-bold text-red-600">{stats.pending || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">👥</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Gesamt</p>
                    <p className="text-3xl font-bold text-blue-600">{participants.length}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Aktivitäten</p>
                    <p className="text-3xl font-bold text-purple-600">{activities.length}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {stats && stats.percentage && (
          <div className="card">
            <p className="text-sm font-semibold text-slate-600 mb-3">Check-In Fortschritt</p>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {stats.checked_in} von {stats.total} Teilnehmern ({stats.percentage}%)
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-bold text-blue-600 mb-4">📋 Schnelle Aktionen</h3>
            <div className="space-y-2">
              <a href="/staff/check-in" className="block p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors font-medium text-slate-800">
                ✓ Check-In durchführen
              </a>
              <a href="/staff/participants" className="block p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors font-medium text-slate-800">
                👥 Teilnehmer verwalten
              </a>
              <a href="/staff/activities" className="block p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors font-medium text-slate-800">
                🎯 Aktivitäten durchführen
              </a>
              <a href="/staff/pocket-money" className="block p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors font-medium text-slate-800">
                💰 Taschengeld verwalten
              </a>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-blue-600 mb-4">ℹ️ System Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Camp:</span>
                <span className="font-semibold text-slate-800">BULA2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dein Status:</span>
                <span className="font-semibold text-green-600">✓ Aktiv</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Uhrzeit:</span>
                <span className="font-semibold">{new Date().toLocaleTimeString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Datum:</span>
                <span className="font-semibold">{new Date().toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-bold text-blue-600 mb-4">🎯 Verfügbare Aktivitäten</h3>
          {activities.length === 0 ? (
            <p className="text-slate-600">Keine Aktivitäten verfügbar</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.slice(0, 4).map(a => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-600">{a.category}</p>
                  {a.location && <p className="text-xs text-slate-600">📍 {a.location}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
