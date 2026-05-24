import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'
import { useCamp } from '../context/CampContext'

export default function AdminCamps({ onLogout }) {
  const { campId } = useCamp()
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    location: '',
    description: '',
    fee: '',
    status: 'active'
  })

  useEffect(() => {
    loadCamps()
  }, [])

  const loadCamps = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get('/camps/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCamps(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError('Fehler beim Laden der Camps')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      if (editingId) {
        await api.patch(`/camps/${editingId}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } else {
        await api.post('/camps/', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }

      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        max_participants: '',
        location: '',
        description: '',
        fee: '',
        status: 'active'
      })
      setShowForm(false)
      setEditingId(null)
      loadCamps()
    } catch (err) {
      setError('Fehler beim Speichern des Camps')
      console.error('Error:', err)
    }
  }

  const handleEdit = (camp) => {
    setFormData(camp)
    setEditingId(camp.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Möchten Sie dieses Camp wirklich löschen?')) {
      try {
        const token = localStorage.getItem('token')
        await api.delete(`/camps/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        loadCamps()
      } catch (err) {
        setError('Fehler beim Löschen des Camps')
        console.error('Error:', err)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-navy">Camp Verwaltung</h2>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (editingId) {
                setEditingId(null)
                setFormData({
                  name: '',
                  start_date: '',
                  end_date: '',
                  max_participants: '',
                  location: '',
                  description: '',
                  fee: '',
                  status: 'active'
                })
              }
            }}
            className="px-6 py-3 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
          >
            {showForm ? '✕ Abbrechen' : '+ Neues Camp'}
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

        {/* Form */}
        {showForm && (
          <div className="card">
            <h3 className="text-xl font-bold text-navy mb-6">
              {editingId ? 'Camp bearbeiten' : 'Neues Camp erstellen'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Camp Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Startdatum *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Enddatum *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max. Teilnehmer *</label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gebühr (€) *</label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                    <option value="archived">Archiviert</option>
                  </select>
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
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      name: '',
                      start_date: '',
                      end_date: '',
                      max_participants: '',
                      location: '',
                      description: '',
                      fee: '',
                      status: 'active'
                    })
                  }}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
                >
                  {editingId ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Camps List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-slate-600">Camps werden geladen...</p>
            </div>
          </div>
        ) : camps.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 text-lg">Noch keine Camps erstellt.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
            >
              + Erstes Camp erstellen
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {camps.map(camp => (
              <div key={camp.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy">{camp.name}</h3>
                    <p className="text-slate-600 text-sm mt-1">{camp.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-600">📅 Start</p>
                        <p className="font-semibold text-navy">{new Date(camp.start_date).toLocaleDateString('de-DE')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">📅 Ende</p>
                        <p className="font-semibold text-navy">{new Date(camp.end_date).toLocaleDateString('de-DE')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">👥 Max. Teilnehmer</p>
                        <p className="font-semibold text-navy">{camp.max_participants}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">💶 Gebühr</p>
                        <p className="font-semibold text-navy">€ {parseFloat(camp.fee).toFixed(2)}</p>
                      </div>
                    </div>
                    {camp.location && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-600">📍 Ort</p>
                        <p className="text-slate-800">{camp.location}</p>
                      </div>
                    )}
                    <div className="mt-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        camp.status === 'active' ? 'bg-green-100 text-green-800' :
                        camp.status === 'inactive' ? 'bg-slate-100 text-slate-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {camp.status === 'active' ? '✓ Aktiv' : camp.status === 'inactive' ? '⏸ Inaktiv' : '📦 Archiviert'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(camp)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                    >
                      ✏️ Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
