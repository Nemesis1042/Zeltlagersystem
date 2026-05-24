import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'
import TentAssignment from '../components/TentAssignment'

export default function AdminTents({ onLogout }) {
  const [tents, setTents] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedTent, setSelectedTent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '8',
    color: '#4a86e8'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const tentResponse = await api.get('/tents/?camp_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTents(Array.isArray(tentResponse.data) ? tentResponse.data : [])

      const partResponse = await api.get('/participants/?camp_id=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(Array.isArray(partResponse.data) ? partResponse.data : [])
    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      await api.post('/tents/', {
        ...formData,
        capacity: parseInt(formData.capacity),
        camp_id: 1
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('✓ Zelt erstellt!')
      setTimeout(() => setSuccess(''), 3000)
      setFormData({ name: '', capacity: '8', color: '#4a86e8' })
      setShowForm(false)
      loadData()
    } catch (err) {
      setError('Fehler beim Erstellen des Zeltes')
      console.error('Error:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getTentMembers = (tentId) => {
    return participants.filter(p => p.zelt_id === tentId)
  }

  const getTentOccupancy = (tentId) => {
    const members = getTentMembers(tentId)
    const tent = tents.find(t => t.id === tentId)
    return {
      current: members.length,
      max: tent?.capacity || 8
    }
  }

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Zeltdaten werden geladen...</p>
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
            <h2 className="text-3xl font-bold text-navy mb-2">⛺ Zeltplätze</h2>
            <p className="text-slate-600">Verwalten Sie Zeltplätze und Zuweisungen</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
          >
            {showForm ? '✕ Abbrechen' : '+ Neues Zelt'}
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

        {/* New Tent Form */}
        {showForm && (
          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-6">Neues Zelt erstellen</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Zeltname *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="z.B. Zelt A, Nordwest"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kapazität *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Farbe</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg cursor-pointer h-10"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ name: '', capacity: '8', color: '#4a86e8' })
                  }}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tents Overview */}
        {tents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 text-lg mb-4">Noch keine Zelte erstellt</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
            >
              + Erstes Zelt erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tents.map(tent => {
              const occupancy = getTentOccupancy(tent.id)
              const members = getTentMembers(tent.id)
              const occupancyPercent = (occupancy.current / occupancy.max) * 100

              return (
                <div
                  key={tent.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedTent(selectedTent === tent.id ? null : tent.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-navy">{tent.name}</h3>
                      <p className="text-sm text-slate-600">Kapazität: {tent.capacity} Personen</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: tent.color || '#4a86e8' }}
                    >
                      ⛺
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-slate-600">Auslastung</p>
                      <p className="text-sm font-bold text-navy">{occupancy.current}/{occupancy.max}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          occupancyPercent > 100 ? 'bg-red-500' :
                          occupancyPercent > 80 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Members List */}
                  {selectedTent === tent.id && members.length > 0 && (
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <h4 className="font-semibold text-slate-700 mb-2">Insassen:</h4>
                      <div className="space-y-1">
                        {members.map(m => (
                          <p key={m.id} className="text-sm text-slate-600">
                            • {m.tn_vorname} {m.tn_familienname}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tent Assignment Component */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-navy mb-6">🏕️ Zeltplatz-Verwaltung</h3>
          <TentAssignment campId={1} />
        </div>
      </div>
    </AdminLayout>
  )
}
