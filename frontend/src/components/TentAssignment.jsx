import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function TentAssignment({ campId = 1 }) {
  const [tents, setTents] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newTentName, setNewTentName] = useState('')
  const [newTentCapacity, setNewTentCapacity] = useState('8')
  const [selectedTent, setSelectedTent] = useState(null)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  useEffect(() => {
    loadData()
  }, [campId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')

      // Load tents
      const tentsRes = await api.get(`/tents/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Ensure tents is always an array
      const tentsData = Array.isArray(tentsRes.data) ? tentsRes.data : []
      setTents(tentsData)

      // Load participants
      const partsRes = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Ensure participants is always an array
      const partsData = Array.isArray(partsRes.data) ? partsRes.data : []
      setParticipants(partsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Fehler beim Laden der Daten')
      setTents([])
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTent = async (e) => {
    e.preventDefault()
    if (!newTentName.trim()) {
      setError('Bitte Zeltname eingeben')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await api.post('/tents/', {
        name: newTentName,
        kapazitaet: parseInt(newTentCapacity) || 8,
        camp_id: campId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Zelt erstellt!')
      setNewTentName('')
      setNewTentCapacity('8')
      setTimeout(() => setSuccess(''), 3000)
      await loadData()
    } catch (err) {
      console.error('Error creating tent:', err)
      setError('Fehler beim Erstellen des Zelts')
    }
  }

  const handleAssignParticipant = async () => {
    if (!selectedTent || !selectedParticipant) {
      setError('Bitte Zelt und Teilnehmer wählen')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await api.patch(`/participants/${selectedParticipant.id}`, {
        zelt_id: selectedTent.id
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setSuccess('Teilnehmer zugewiesen!')
      setSelectedTent(null)
      setSelectedParticipant(null)
      setTimeout(() => setSuccess(''), 3000)
      await loadData()
    } catch (err) {
      console.error('Error assigning participant:', err)
      setError('Fehler beim Zuweisen des Teilnehmers')
    }
  }

  const getUnassignedParticipants = () => {
    if (!Array.isArray(participants)) return []
    return participants.filter(p => !p.zelt_id)
  }

  const getTentMembers = (tentId) => {
    if (!Array.isArray(participants)) return []
    return participants.filter(p => p.zelt_id === tentId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-slate-600">Zeltdaten werden geladen...</p>
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

      {/* Create Tent Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-6">🏕️ Neues Zelt erstellen</h3>
        <form onSubmit={handleCreateTent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Zeltname *</label>
              <input
                type="text"
                value={newTentName}
                onChange={(e) => setNewTentName(e.target.value)}
                placeholder="z.B. Zelt A"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kapazität *</label>
              <input
                type="number"
                value={newTentCapacity}
                onChange={(e) => setNewTentCapacity(e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold"
          >
            🏕️ Zelt erstellen
          </button>
        </form>
      </div>

      {/* Assign Participants */}
      <div className="card">
        <h3 className="text-xl font-bold text-navy mb-6">👥 Teilnehmer zuweisen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Zelt wählen</label>
            <select
              value={selectedTent?.id || ''}
              onChange={(e) => {
                const tentId = parseInt(e.target.value)
                const tent = tents.find(t => t.id === tentId)
                setSelectedTent(tent || null)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="">-- Zelt wählen --</option>
              {Array.isArray(tents) && tents.map(tent => (
                <option key={tent.id} value={tent.id}>
                  {tent.name} ({tent.belegt || 0}/{tent.kapazitaet})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teilnehmer ({getUnassignedParticipants().length} ungezuwiesen)
            </label>
            <select
              value={selectedParticipant?.id || ''}
              onChange={(e) => {
                const partId = parseInt(e.target.value)
                const part = getUnassignedParticipants().find(p => p.id === partId)
                setSelectedParticipant(part || null)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="">-- Teilnehmer wählen --</option>
              {getUnassignedParticipants().map(p => (
                <option key={p.id} value={p.id}>
                  {p.vorname} {p.nachname}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAssignParticipant}
            disabled={!selectedTent || !selectedParticipant}
            className="w-full px-6 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👤 Zuweisen
          </button>
        </div>
      </div>

      {/* Tents Overview */}
      {Array.isArray(tents) && tents.length > 0 ? (
        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-6">🏕️ Zelt-Übersicht</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tents.map(tent => {
              const members = getTentMembers(tent.id)
              const occupancyPercent = tent.kapazitaet > 0 ? (tent.belegt / tent.kapazitaet) * 100 : 0

              return (
                <div key={tent.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-navy">{tent.name}</h4>
                      <p className="text-sm text-slate-600">{tent.belegt || 0}/{tent.kapazitaet} Personen</p>
                    </div>
                    <div className="text-3xl">⛺</div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPercent > 100 ? 'bg-red-500' :
                        occupancyPercent > 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                    ></div>
                  </div>

                  {members.length > 0 && (
                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Insassen:</p>
                      <div className="space-y-1">
                        {members.map(m => (
                          <p key={m.id} className="text-sm text-slate-600">
                            • {m.vorname} {m.nachname}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-slate-600">Noch keine Zelte erstellt</p>
        </div>
      )}
    </div>
  )
}
