import { useState, useEffect } from 'react'
import api from '../utils/api'
import ElternLayout from '../components/ElternLayout'

export default function ElternChild({ onLogout }) {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadChildData()
  }, [])

  const loadChildData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')

      // Get participant data for logged in user
      const response = await api.get('/participants/?camp_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Filter participant data (in real app, backend would return only user's child)
      const participants = Array.isArray(response.data) ? response.data : []
      if (participants.length > 0) {
        setParticipant(participants[0])
      }
    } catch (err) {
      setError('Fehler beim Laden der Kinddaten')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ElternLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Daten werden geladen...</p>
          </div>
        </div>
      </ElternLayout>
    )
  }

  if (!participant) {
    return (
      <ElternLayout onLogout={onLogout}>
        <div className="card text-center py-12">
          <p className="text-slate-600">Keine Kinddaten gefunden</p>
        </div>
      </ElternLayout>
    )
  }

  return (
    <ElternLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">👤 Kinddaten</h2>
          <p className="text-slate-600">Informationen zu Ihrem Kind</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-semibold">Fehler</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Personal Info */}
        <div className="card">
          <h3 className="text-xl font-bold text-slate-800 mb-6">👤 Persönliche Daten</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600">Vorname</p>
              <p className="text-lg font-semibold text-slate-800">{participant.tn_vorname}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Nachname</p>
              <p className="text-lg font-semibold text-slate-800">{participant.tn_familienname}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Geburtstag</p>
              <p className="text-lg font-semibold text-slate-800">
                {participant.tn_geburtsdatum ? new Date(participant.tn_geburtsdatum).toLocaleDateString('de-DE') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Zelt</p>
              <p className="text-lg font-semibold text-slate-800">
                {participant.zelt_name || (participant.zelt_id ? `Zelt ${participant.zelt_id}` : '-')}
              </p>
            </div>
          </div>
        </div>

        {/* Health Info */}
        <div className="card">
          <h3 className="text-xl font-bold text-slate-800 mb-6">⚕️ Gesundheitsinformationen</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Allergien</p>
              <p className="text-slate-800">{participant.allergien || 'Keine bekannt'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Krankenversicherung</p>
              <p className="text-slate-800">{participant.krankenkasse || '-'}</p>
            </div>
            {participant.medikamente && (
              <div>
                <p className="text-sm text-slate-600">Medikamente</p>
                <p className="text-slate-800">{participant.medikamente}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Vegetarier/Vegan</p>
              <p className="text-slate-800">
                {participant.vegetarier ? 'Vegetarisch' : participant.vegan ? 'Vegan' : 'Keine Einschränkung'}
              </p>
            </div>
          </div>
        </div>

        {/* Camp Status */}
        <div className="card bg-green-50 border border-green-200">
          <h3 className="text-xl font-bold text-green-600 mb-4">📊 Lagerstatus</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Check-In</p>
              <p className="text-lg font-bold text-green-600">
                {participant.check_in_time ? '✓ Eingecheckt' : 'Ausstehend'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className={`text-lg font-bold ${
                participant.status === 'angekommen' ? 'text-green-600' : 'text-slate-600'
              }`}>
                {participant.status === 'angekommen' ? '✓ Angekommen' : 'Ausstehend'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ElternLayout>
  )
}
