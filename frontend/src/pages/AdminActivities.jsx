import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'
import ActivityGenerator from '../components/ActivityGenerator'

export default function AdminActivities({ onLogout }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hobbygruppe',
    location: '',
    group_size: '10'
  })

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
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      await api.post('/activities/', {
        ...formData,
        group_size: parseInt(formData.group_size),
        camp_id: 1
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('✓ Aktivität erstellt!')
      setTimeout(() => setSuccess(''), 3000)
      resetForm()
      loadActivities()
    } catch (err) {
      setError('Fehler beim Erstellen der Aktivität')
      console.error('Error:', err)
    }
  }

  const handleEdit = (activity) => {
    setFormData({
      name: activity.name,
      description: activity.description || '',
      category: activity.category || 'hobbygruppe',
      location: activity.location || '',
      group_size: activity.group_size?.toString() || '10'
    })
    setSelectedActivity(activity.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Möchten Sie diese Aktivität wirklich löschen?')) {
      try {
        const token = localStorage.getItem('token')
        await api.delete(`/activities/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setSuccess('✓ Aktivität gelöscht!')
        setTimeout(() => setSuccess(''), 3000)
        loadActivities()
      } catch (err) {
        setError('Fehler beim Löschen der Aktivität')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'hobbygruppe',
      location: '',
      group_size: '10'
    })
    setSelectedActivity(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const categoryEmojis = {
    hobbygruppe: '🎨',
    sport: '⚽',
    kreativ: '✏️',
    geländespiel: '🏃',
    sonstiges: '🎯'
  }

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Aktivitäten werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy mb-2">🎯 Aktivitäten</h2>
            <p className="text-slate-600">Verwalten Sie Lageractivitäten und Gruppen</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
          >
            {showForm ? '✕ Abbrechen' : '+ Neue Aktivität'}
          </button>
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

        {/* Form */}
        {showForm && (
          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-6">
              {selectedActivity ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="z.B. Klettertour"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kategorie</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="hobbygruppe">Hobbygruppe</option>
                    <option value="sport">Sport</option>
                    <option value="kreativ">Kreativ</option>
                    <option value="geländespiel">Geländespiel</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ort</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="z.B. Sporthalle"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gruppengröße</label>
                  <input
                    type="number"
                    name="group_size"
                    value={formData.group_size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
                >
                  {selectedActivity ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activities List */}
        {activities.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 text-lg mb-4">Noch keine Aktivitäten erstellt</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
            >
              + Erste Aktivität erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(activity => (
              <div key={activity.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">
                      {categoryEmojis[activity.category] || '🎯'}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-navy">{activity.name}</h3>
                      <p className="text-sm text-slate-600 capitalize">{activity.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      🗑️
                    </button>
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Generator */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-navy mb-6">📋 Automatische Gruppenaufteilung</h3>
          <ActivityGenerator campId={1} />
        </div>
      </div>
    </AdminLayout>
  )
}
