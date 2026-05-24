import { useState, useEffect } from 'react'
import api from '../utils/api'
import StaffLayout from '../components/StaffLayout'
import ActivityGenerator from '../components/ActivityGenerator'

export default function StaffActivities({ onLogout }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get('/activities/?camp_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setActivities(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError('Fehler beim Laden der Aktivitäten')
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
            <p className="text-slate-600">Aktivitäten werden geladen...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  const categoryEmojis = {
    hobbygruppe: '🎨',
    sport: '⚽',
    kreativ: '✏️',
    geländespiel: '🏃',
    sonstiges: '🎯'
  }

  return (
    <StaffLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2">🎯 Aktivitäten</h2>
          <p className="text-slate-600">Verwalten und durchführen Sie Aktivitäten</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-semibold">Fehler</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Activities List */}
        {activities.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600">Keine Aktivitäten verfügbar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(activity => (
              <div key={activity.id} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{categoryEmojis[activity.category] || '🎯'}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{activity.name}</h3>
                    <p className="text-sm text-slate-600 capitalize">{activity.category}</p>
                  </div>
                </div>

                {activity.description && (
                  <p className="text-sm text-slate-600 mb-3">{activity.description}</p>
                )}

                <div className="space-y-2 text-sm border-t border-slate-200 pt-3">
                  {activity.location && (
                    <p className="text-slate-600">📍 <span className="font-medium">{activity.location}</span></p>
                  )}
                  <p className="text-slate-600">👥 Gruppengröße: <span className="font-medium">{activity.group_size}</span></p>
                  <button className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm">
                    ▶️ Starten
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group Generator */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-blue-600 mb-6">📋 Gruppenaufteilung</h3>
          <ActivityGenerator campId={1} />
        </div>
      </div>
    </StaffLayout>
  )
}
