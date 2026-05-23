import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function ActivityGenerator({ campId = 1 }) {
  const [activities, setActivities] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [groups, setGroups] = useState([])
  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityDesc, setNewActivityDesc] = useState('')
  const [newActivityCategory, setNewActivityCategory] = useState('hobbygruppe')
  const [newActivityGroupSize, setNewActivityGroupSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatingGroups, setGeneratingGroups] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/activities/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setActivities(response.data || [])
    } catch (err) {
      console.error('Error loading activities:', err)
    }
  }

  const loadGroups = async (activityId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/activities/${activityId}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setGroups(response.data || [])
    } catch (err) {
      setError('Fehler beim Laden der Gruppen')
    }
  }

  const createActivity = async (e) => {
    e.preventDefault()
    if (!newActivityName) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.post('/activities/',
        {
          name: newActivityName,
          description: newActivityDesc,
          category: newActivityCategory,
          group_size: parseInt(newActivityGroupSize)
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setActivities([...activities, response.data.activity])
      setNewActivityName('')
      setNewActivityDesc('')
      setNewActivityCategory('hobbygruppe')
      setNewActivityGroupSize(10)
      setSuccess('Aktivität erstellt!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Erstellen der Aktivität')
    } finally {
      setLoading(false)
    }
  }

  const generateGroups = async (activityId) => {
    try {
      setGeneratingGroups(true)
      const token = localStorage.getItem('token')
      const response = await api.post(`/activities/${activityId}/generate-groups`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSuccess(`${response.data.num_groups} Gruppen erstellt!`)
      await loadGroups(activityId)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Erstellen der Gruppen')
    } finally {
      setGeneratingGroups(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
          <span className="text-lg">✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* Create Activity Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">🎯 Neue Aktivität erstellen</h3>
        <form onSubmit={createActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Aktivitätsname</label>
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              placeholder="z.B. Klettern, Schwimmen, Handwerk..."
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Beschreibung</label>
            <textarea
              value={newActivityDesc}
              onChange={(e) => setNewActivityDesc(e.target.value)}
              placeholder="Was wird gemacht?"
              className="input-field h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">Kategorie</label>
              <select
                value={newActivityCategory}
                onChange={(e) => setNewActivityCategory(e.target.value)}
                className="input-field"
              >
                <option value="hobbygruppe">Hobbygruppe</option>
                <option value="sport">Sport</option>
                <option value="handwerk">Handwerk</option>
                <option value="musik">Musik</option>
                <option value="spiele">Spiele</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">Gruppengröße</label>
              <input
                type="number"
                value={newActivityGroupSize}
                onChange={(e) => setNewActivityGroupSize(e.target.value)}
                min="2"
                max="30"
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            🎯 Aktivität erstellen
          </button>
        </form>
      </div>

      {/* Activities List */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">🎯 Aktivitäten ({activities.length})</h3>
        <div className="space-y-3">
          {activities.map(activity => (
            <div
              key={activity.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedActivity?.id === activity.id
                  ? 'border-gold bg-gold/5'
                  : 'border-slate-200 hover:border-gold/50'
              }`}
              onClick={() => {
                setSelectedActivity(activity)
                loadGroups(activity.id)
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-navy">{activity.name}</h4>
                  {activity.description && (
                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Kategorie: {activity.category} | Gruppengr.: {activity.group_size}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    generateGroups(activity.id)
                  }}
                  disabled={generatingGroups}
                  className="btn-primary text-sm"
                >
                  👫 Gruppen
                </button>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-slate-600 text-center py-4">Keine Aktivitäten vorhanden</p>
          )}
        </div>
      </div>

      {/* Groups Display */}
      {selectedActivity && groups.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-4">
            👫 Gruppen - {selectedActivity.name} ({groups.length} Gruppen)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, idx) => (
              <div key={group.id} className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-navy mb-3">Gruppe {idx + 1}</h4>
                <ul className="space-y-1 text-sm text-slate-700">
                  {group.members && group.members.map(member => (
                    <li key={member.id} className="flex items-center gap-2">
                      <span className="text-gold">•</span>
                      <span>TN {member.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
