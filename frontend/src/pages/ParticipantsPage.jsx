import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([])
  const [registrations, setRegistrations] = useState({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterZelt, setFilterZelt] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [tents, setTents] = useState([])
  const [viewMode, setViewMode] = useState('grid') // grid or table

  const CAMP_ID = 1 // Hardcoded for MVP

  useEffect(() => {
    loadParticipants()
    loadTents()
  }, [])

  const loadParticipants = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/participants/?camp_id=${CAMP_ID}`)
      setParticipants(response.data)

      // Load registration details for each participant
      const regData = {}
      for (const p of response.data) {
        try {
          const reg = await api.get(`/registrations/${p.registration_id}`)
          regData[p.id] = reg.data
        } catch (e) {
          console.error(`Error loading registration for participant ${p.id}`)
        }
      }
      setRegistrations(regData)
    } catch (err) {
      console.error('Error loading participants:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTents = async () => {
    try {
      const response = await api.get(`/tents/?camp_id=${CAMP_ID}`)
      setTents(response.data)
    } catch (err) {
      console.error('Error loading tents:', err)
    }
  }

  const getTentName = (tentId) => {
    const tent = tents.find(t => t.id === tentId)
    return tent ? tent.name : 'Nicht zugewiesen'
  }

  const getRegistration = (participantId) => {
    return registrations[participantId] || {}
  }

  // Filter participants
  const filtered = participants.filter(p => {
    const reg = getRegistration(p.id)
    const name = `${reg.tn_vorname || ''} ${reg.tn_familienname || ''}`.toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase())
    const matchesZelt = !filterZelt || p.zelt_id === parseInt(filterZelt)
    return matchesSearch && matchesZelt
  })

  const handleAssignZelt = async (participantId, tentId) => {
    try {
      await api.post(`/tents/${tentId}/assign-participant/${participantId}`)
      await loadParticipants()
      alert('✓ Zelt zugewiesen')
    } catch (err) {
      alert('❌ Fehler beim Zuweisen des Zeltes')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">👥 Teilnehmer ({filtered.length}/{participants.length})</h2>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">🔍 Suche (Name)</label>
              <input
                type="text"
                placeholder="Max Mustermann..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            {/* Filter Zelt */}
            <div>
              <label className="block text-sm font-medium mb-2">🏕️ Zelt filtern</label>
              <select
                value={filterZelt}
                onChange={(e) => setFilterZelt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Alle Zelte</option>
                {tents.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.capacity})</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">👁️ Ansicht</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Kacheln
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Tabelle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const reg = getRegistration(p.id)
              const hasAllergies = reg.allergien && reg.allergien.length > 0
              const hasMedications = reg.medikamente && reg.medikamente.length > 0

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedParticipant(p)}
                >
                  <div className="p-4 space-y-3">
                    {/* Name */}
                    <h3 className="font-bold text-lg">
                      {reg.tn_vorname} {reg.tn_familienname}
                    </h3>

                    {/* Status */}
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.status === 'angekommen'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'krank'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status === 'angekommen' ? '✓ Angekommen' : p.status === 'krank' ? '⚠️ Krank' : '➜ Erwartet'}
                      </span>
                      {hasAllergies && <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">⚠️ Allergie</span>}
                      {hasMedications && <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">💊 Medikamente</span>}
                      {reg.schwimmer && <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">🏊 Schwimmer</span>}
                    </div>

                    {/* Zelt */}
                    <div className="text-sm">
                      <p className="text-gray-600">🏕️ {getTentName(p.zelt_id)}</p>
                    </div>

                    {/* Alter */}
                    <div className="text-sm text-gray-600">
                      Alter: {calculateAge(reg.tn_geburtsdatum)} Jahre
                    </div>

                    {/* Allergies */}
                    {hasAllergies && (
                      <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
                        <p className="font-semibold text-red-800">Allergien:</p>
                        <p className="text-red-700">{reg.allergien}</p>
                      </div>
                    )}

                    {/* Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedParticipant(p)
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Details ansehen
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Alter</th>
                  <th className="px-4 py-3 text-left font-semibold">Zelt</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Besonderheiten</th>
                  <th className="px-4 py-3 text-center font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const reg = getRegistration(p.id)
                  const special = []
                  if (reg.allergien) special.push('🚨 Allergie')
                  if (reg.medikamente) special.push('💊 Medikamente')
                  if (reg.schwimmer) special.push('🏊')
                  if (reg.vegetarier || reg.vegan) special.push('🥗')

                  return (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">
                        {reg.tn_vorname} {reg.tn_familienname}
                      </td>
                      <td className="px-4 py-3">
                        {calculateAge(reg.tn_geburtsdatum)}
                      </td>
                      <td className="px-4 py-3">
                        {getTentName(p.zelt_id)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.status === 'angekommen'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {p.status === 'angekommen' ? '✓' : '➜'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {special.join(' ')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedParticipant(p)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedParticipant && (
        <ParticipantModal
          participant={selectedParticipant}
          registration={getRegistration(selectedParticipant.id)}
          tents={tents}
          onClose={() => setSelectedParticipant(null)}
          onAssignZelt={handleAssignZelt}
        />
      )}
    </div>
  )
}

function ParticipantModal({ participant, registration, tents, onClose, onAssignZelt }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {registration.tn_vorname} {registration.tn_familienname}
          </h2>
          <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal */}
          <section>
            <h3 className="font-bold text-lg mb-3 border-b pb-2">👤 Persönliche Daten</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Geburtsdatum</p>
                <p className="font-medium">{registration.tn_geburtsdatum} ({calculateAge(registration.tn_geburtsdatum)} J.)</p>
              </div>
              <div>
                <p className="text-gray-600">Geschlecht</p>
                <p className="font-medium">{registration.tn_geschlecht}</p>
              </div>
              <div>
                <p className="text-gray-600">Adresse</p>
                <p className="font-medium">
                  {registration.tn_strasse}<br/>
                  {registration.tn_plz} {registration.tn_ort}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Kontakt</p>
                <p className="font-medium">{registration.tn_email || '-'}</p>
              </div>
            </div>
          </section>

          {/* Zeltplatz */}
          <section>
            <h3 className="font-bold text-lg mb-3 border-b pb-2">🏕️ Zeltplatz</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Aktuell: <span className="font-medium">{tents.find(t => t.id === participant.zelt_id)?.name || 'Nicht zugewiesen'}</span>
              </p>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onAssignZelt(participant.id, parseInt(e.target.value))
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Zelt auswählen...</option>
                {tents.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.capacity})
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Notfallkontakte */}
          <section>
            <h3 className="font-bold text-lg mb-3 border-b pb-2">☎️ Notfallkontakte</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Sorgeberechtigte(r)</p>
                <p className="font-medium">
                  {registration.sorge_anrede} {registration.sorge_vorname} {registration.sorge_familienname}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {registration.sorge_telefon_mobil}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Notfallkontakt</p>
                <p className="font-medium">{registration.notfall_name} ({registration.notfall_beziehung})</p>
                <p className="text-sm text-gray-600">
                  📞 {registration.notfall_telefon}
                </p>
              </div>
            </div>
          </section>

          {/* Gesundheit */}
          <section>
            <h3 className="font-bold text-lg mb-3 border-b pb-2">🏥 Gesundheit</h3>
            <div className="space-y-2 text-sm">
              {registration.allergien && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="font-semibold text-red-800">⚠️ Allergien:</p>
                  <p className="text-red-700">{registration.allergien}</p>
                </div>
              )}
              {registration.medikamente && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="font-semibold text-yellow-800">💊 Medikamente:</p>
                  <p className="text-yellow-700">{registration.medikamente}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-600">Schwimmer</p>
                  <p className="font-medium">{registration.schwimmer ? '✓ Ja' : '✗ Nein'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ernährung</p>
                  <p className="font-medium">
                    {registration.vegetarier ? 'Vegetarisch' : registration.vegan ? 'Vegan' : 'Normal'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Status */}
          <section>
            <h3 className="font-bold text-lg mb-3 border-b pb-2">Status</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Aktueller Status</p>
                <p className="font-medium">
                  {participant.status === 'angekommen' ? '✓ Angekommen' : participant.status === 'krank' ? '⚠️ Krank' : '➜ Erwartet'}
                </p>
              </div>
              {participant.check_in_time && (
                <div>
                  <p className="text-sm text-gray-600">Check-In Zeit</p>
                  <p className="font-medium">{new Date(participant.check_in_time).toLocaleString('de-DE')}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function calculateAge(birthDate) {
  if (!birthDate) return '-'
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
