import { useState, useEffect } from 'react'
import api from '../utils/api'

const categoryEmojis = {
  hobbygruppe: '🎨',
  sport: '⚽',
  kreativ: '✏️',
  geländespiel: '🏃',
  musik: '🎵',
  handwerk: '🔨',
  spiele: '🎮',
  sonstiges: '🎯'
}

export default function ActivityGenerator({ campId = 1 }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityDesc, setNewActivityDesc] = useState('')
  const [newActivityCategory, setNewActivityCategory] = useState('hobbygruppe')
  const [newActivityGroupSize, setNewActivityGroupSize] = useState('10')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [campId])

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')

      const response = await api.get(`/activities/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Ensure activities is always an array
      const activitiesData = Array.isArray(response.data) ? response.data : []
      setActivities(activitiesData)
    } catch (err) {
      console.error('Error loading activities:', err)
      setError('Fehler beim Laden der Aktivitäten')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateActivity = async (e) => {
    e.preventDefault()
    if (!newActivityName.trim()) {
      setError('Bitte Aktivitätsnamen eingeben')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const token = localStorage.getItem('token')

      await api.post('/activities/', {
        name: newActivityName,
        description: newActivityDesc,
        category: newActivityCategory,
        group_size: parseInt(newActivityGroupSize) || 10,
        camp_id: campId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Aktivität erstellt!')
      setNewActivityName('')
      setNewActivityDesc('')
      setNewActivityCategory('hobbygruppe')
      setNewActivityGroupSize('10')
      setTimeout(() => setSuccess(''), 3000)
      await loadActivities()
    } catch (err) {
      console.error('Error creating activity:', err)
      setError('Fehler beim Erstellen der Aktivität')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteActivity = async (activityId) => {
    if (!confirm('Möchten Sie diese Aktivität wirklich löschen?')) return

    try {
      setError('')
      const token = localStorage.getItem('token')
      await api.delete(`/activities/${activityId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Aktivität gelöscht!')
      setTimeout(() => setSuccess(''), 3000)
      await loadActivities()
    } catch (err) {
      console.error('Error deleting activity:', err)
      setError('Fehler beim Löschen der Aktivität')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-slate-600">Aktivitäten werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <p className="font-semibold">Fehler</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
          <p className="font-semibold">Erfolg</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Create Activity Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-6">🎯 Neue Aktivität erstellen</h3>
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Aktivitätsname *</label>
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="z.B. Klettern"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategorie</label>
              <select
                value={newActivityCategory}
                onChange={(e) => setNewActivityCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="hobbygruppe">Hobbygruppe</option>
                <option value="sport">Sport</option>
                <option value="kreativ">Kreativ</option>
                <option value="geländespiel">Geländespiel</option>
                <option value="musik">Musik</option>
                <option value="handwerk">Handwerk</option>
                <option value="spiele">Spiele</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
            <textarea
              value={newActivityDesc}
              onChange={(e) => setNewActivityDesc(e.target.value)}
              placeholder="Was wird gemacht?"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gruppengröße</label>
            <input
              type="number"
              value={newActivityGroupSize}
              onChange={(e) => setNewActivityGroupSize(e.target.value)}
              min="2"
              max="30"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎯 Aktivität erstellen
          </button>
        </form>
      </div>

      {/* Activities List */}
      {Array.isArray(activities) && activities.length > 0 ? (
        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-6">🎯 Aktivitäten ({activities.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(activity => (
              <div key={activity.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">
                      {categoryEmojis[activity.category] || '🎯'}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-navy">{activity.name}</h4>
                      <p className="text-sm text-slate-600 capitalize">{activity.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                {activity.description && (
                  <p className="text-sm text-slate-600 mb-3">{activity.description}</p>
                )}

                <div className="border-t border-slate-200 pt-3">
                  <p className="text-sm text-slate-600">
                    👥 Gruppengröße: <span className="font-medium">{activity.group_size}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-slate-600">Noch keine Aktivitäten erstellt</p>
        </div>
      )}
    </div>
  )
}
