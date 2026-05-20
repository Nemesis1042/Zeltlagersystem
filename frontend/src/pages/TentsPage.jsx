import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TentsPage() {
  const [tents, setTents] = useState([])
  const [participants, setParticipants] = useState({})
  const [loading, setLoading] = useState(false)
  const [showAddTentForm, setShowAddTentForm] = useState(false)
  const [newTentName, setNewTentName] = useState('')
  const [message, setMessage] = useState('')

  const CAMP_ID = 1

  useEffect(() => {
    loadTents()
    loadParticipants()
  }, [])

  const loadTents = async () => {
    try {
      const response = await axios.get(`/api/tents/?camp_id=${CAMP_ID}`)
      setTents(response.data)
    } catch (err) {
      console.error('Error loading tents:', err)
    }
  }

  const loadParticipants = async () => {
    try {
      const response = await axios.get(`/api/participants/?camp_id=${CAMP_ID}`)
      const byTent = {}
      response.data.forEach(p => {
        if (p.zelt_id) {
          if (!byTent[p.zelt_id]) byTent[p.zelt_id] = []
          byTent[p.zelt_id].push(p)
        }
      })
      setParticipants(byTent)
    } catch (err) {
      console.error('Error loading participants:', err)
    }
  }

  const handleAddTent = async (e) => {
    e.preventDefault()
    if (!newTentName.trim()) return

    try {
      await axios.post(`/api/tents/`, {
        name: newTentName,
        capacity: 8
      }, {
        params: { camp_id: CAMP_ID }
      })

      setNewTentName('')
      setShowAddTentForm(false)
      setMessage('✓ Zelt hinzugefügt')
      setTimeout(() => setMessage(''), 2000)
      await loadTents()
    } catch (err) {
      setMessage('❌ Fehler beim Hinzufügen')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const getTentParticipants = (tentId) => {
    return participants[tentId] || []
  }

  const totalAssigned = Object.values(participants).flat().length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🏕️ Zeltplatz-Verwaltung</h2>
        <button
          onClick={() => setShowAddTentForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Zelt hinzufügen
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Zelte gesamt</p>
          <p className="text-3xl font-bold text-blue-600">{tents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">TN zugewiesen</p>
          <p className="text-3xl font-bold text-green-600">{totalAssigned}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Kapazität gesamt</p>
          <p className="text-3xl font-bold text-purple-600">
            {tents.reduce((sum, t) => sum + (t.capacity || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Auslastung</p>
          <p className="text-3xl font-bold text-orange-600">
            {tents.length > 0
              ? Math.round(totalAssigned / tents.reduce((sum, t) => sum + (t.capacity || 0), 0) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.startsWith('✓')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Add Tent Form */}
      {showAddTentForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleAddTent} className="space-y-4">
            <h3 className="font-bold text-lg">Neues Zelt</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Zelt-Name</label>
              <input
                type="text"
                placeholder="z.B. Adler 1, Falke 2..."
                value={newTentName}
                onChange={(e) => setNewTentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ Hinzufügen
              </button>
              <button
                type="button"
                onClick={() => setShowAddTentForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tents.map(tent => {
          const tentParticipants = getTentParticipants(tent.id)
          const occupancy = Math.round(tentParticipants.length / (tent.capacity || 8) * 100)
          const isFull = tentParticipants.length >= (tent.capacity || 8)

          return (
            <div
              key={tent.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {/* Header */}
              <div className={`px-6 py-4 ${
                isFull
                  ? 'bg-red-100 border-b-2 border-red-300'
                  : 'bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{tent.name}</h3>
                    <p className="text-sm text-gray-600">
                      Kapazität: {tent.capacity}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isFull
                      ? 'bg-red-200 text-red-800'
                      : 'bg-blue-200 text-blue-800'
                  }`}>
                    {tentParticipants.length}/{tent.capacity}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-300 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      occupancy > 100
                        ? 'bg-red-500'
                        : occupancy > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                  />
                </div>
              </div>

              {/* Participants */}
              <div className="p-6">
                {tentParticipants.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Keine Teilnehmer zugewiesen</p>
                ) : (
                  <div className="space-y-2">
                    {tentParticipants.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                      >
                        <span className="font-medium">→</span>
                        <span className="flex-1">TN #{p.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          p.status === 'angekommen'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {p.status === 'angekommen' ? '✓' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-3 bg-gray-50 border-t space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  👥 TN zuweisen
                </button>
                <button className="w-full px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400">
                  ✎ Bearbeiten
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {tents.length === 0 && (
          <div className="col-span-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">Noch keine Zelte erstellt</p>
            <button
              onClick={() => setShowAddTentForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Erstes Zelt hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
