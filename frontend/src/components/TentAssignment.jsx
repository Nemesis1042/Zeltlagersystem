import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function TentAssignment({ campId = 1 }) {
  const [tents, setTents] = useState([])
  const [participants, setParticipants] = useState([])
  const [selectedTent, setSelectedTent] = useState(null)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [newTentName, setNewTentName] = useState('')
  const [newTentCapacity, setNewTentCapacity] = useState(8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [campId])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [tentsRes, partsRes] = await Promise.all([
        api.get(`/tents/?camp_id=${campId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        api.get(`/participants/?camp_id=${campId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      setTents(tentsRes.data || [])
      setParticipants(partsRes.data || [])
    } catch (err) {
      setError('Fehler beim Laden der Daten')
    }
  }

  const createTent = async (e) => {
    e.preventDefault()
    if (!newTentName) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.post('/tents/',
        { name: newTentName, capacity: parseInt(newTentCapacity) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setTents([...tents, response.data.tent])
      setNewTentName('')
      setNewTentCapacity(8)
      setSuccess('Zelt erstellt!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Fehler beim Erstellen des Zelts')
    } finally {
      setLoading(false)
    }
  }

  const assignParticipant = async () => {
    if (!selectedTent || !selectedParticipant) {
      setError('Bitte wählen Sie ein Zelt und einen Teilnehmer')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await api.post(
        `/tents/${selectedTent.id}/assign-participant/${selectedParticipant.id}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      await loadData()
      setSelectedTent(null)
      setSelectedParticipant(null)
      setSuccess('Teilnehmer zugewiesen!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Zuweisen')
    } finally {
      setLoading(false)
    }
  }

  const getUnassignedParticipants = () => {
    return participants.filter(p => !p.zelt_id)
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

      {/* Create Tent Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">🏕️ Neues Zelt erstellen</h3>
        <form onSubmit={createTent} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Zelt-Name</label>
            <input
              type="text"
              value={newTentName}
              onChange={(e) => setNewTentName(e.target.value)}
              placeholder="z.B. Zelt A, Zelt B..."
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Kapazität</label>
            <input
              type="number"
              value={newTentCapacity}
              onChange={(e) => setNewTentCapacity(e.target.value)}
              min="1"
              max="20"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            🏕️ Zelt erstellen
          </button>
        </form>
      </div>

      {/* Assign Participants */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">👥 Teilnehmer zuweisen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Zelt wählen</label>
            <select
              value={selectedTent?.id || ''}
              onChange={(e) => {
                const tent = tents.find(t => t.id === parseInt(e.target.value))
                setSelectedTent(tent)
              }}
              className="input-field"
            >
              <option value="">-- Bitte wählen --</option>
              {tents.map(tent => (
                <option key={tent.id} value={tent.id}>
                  {tent.name} ({tent.belegt || 0}/{tent.kapazitaet})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Teilnehmer ({getUnassignedParticipants().length} ungezuworden)
            </label>
            <select
              value={selectedParticipant?.id || ''}
              onChange={(e) => {
                const part = getUnassignedParticipants().find(p => p.id === parseInt(e.target.value))
                setSelectedParticipant(part)
              }}
              className="input-field"
            >
              <option value="">-- Bitte wählen --</option>
              {getUnassignedParticipants().map(p => (
                <option key={p.id} value={p.id}>
                  TN {p.id}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={assignParticipant}
            disabled={loading || !selectedTent || !selectedParticipant}
            className="btn-primary w-full"
          >
            👤 Zuweisen
          </button>
        </div>
      </div>

      {/* Tent Overview */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-4">🏕️ Zelt-Übersicht</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tents.map(tent => (
            <div key={tent.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold text-navy mb-2">{tent.name}</p>
              <p className="text-sm text-slate-600 mb-2">
                Kapazität: {tent.belegt || 0}/{tent.kapazitaet}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gold h-2 rounded-full transition-all"
                  style={{ width: `${((tent.belegt || 0) / tent.kapazitaet) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
