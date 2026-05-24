import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import AdminLayout from '../components/AdminLayout'

export default function AdminParticipants({ onLogout }) {
  const { campId } = useCamp()
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDetails, setShowDetails] = useState(null)

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get(`/participants/?camp_id=${campId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setParticipants(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError('Fehler beim Laden der Teilnehmer')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredParticipants = () => {
    return participants.filter(p => {
      const matchesSearch =
        p.tn_vorname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tn_familienname?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || p.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }

  const filteredParticipants = getFilteredParticipants()

  const handleStatusChange = async (participantId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await api.patch(`/participants/${participantId}`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadParticipants()
    } catch (err) {
      setError('Fehler beim Aktualisieren des Status')
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Teilnehmer werden geladen...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-navy mb-2">👥 Teilnehmer Management</h2>
          <p className="text-slate-600">Verwalten Sie alle Teilnehmer des Camps</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">Gesamt</p>
            <p className="text-3xl font-bold text-navy">{participants.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">Angekommen</p>
            <p className="text-3xl font-bold text-green-600">
              {participants.filter(p => p.status === 'angekommen').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">Ausstehend</p>
            <p className="text-3xl font-bold text-yellow-600">
              {participants.filter(p => p.status !== 'angekommen').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 font-medium">In Zelten</p>
            <p className="text-3xl font-bold text-blue-600">
              {participants.filter(p => p.zelt_id).length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nach Name suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="all">Alle Status</option>
              <option value="angekommen">Angekommen</option>
              <option value="gesund">Gesund</option>
              <option value="krank">Krank</option>
            </select>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">
                {filteredParticipants.length} Ergebnisse
              </p>
            </div>
          </div>
        </div>

        {/* Participants List */}
        {filteredParticipants.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600 text-lg">
              {searchTerm || filterStatus !== 'all' ? 'Keine Teilnehmer gefunden' : 'Keine Teilnehmer'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredParticipants.map(p => (
              <div key={p.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-navy">
                      {p.tn_vorname} {p.tn_familienname}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-slate-600">ID</p>
                        <p className="font-semibold text-navy">#{p.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Zelt</p>
                        <p className="font-semibold text-navy">
                          {p.zelt_name ? p.zelt_name : (p.zelt_id ? `Zelt ${p.zelt_id}` : '-')}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Check-In</p>
                        <p className="font-semibold">
                          {p.check_in_time ? '✓ ' + new Date(p.check_in_time).toLocaleDateString('de-DE') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Gesundheit</p>
                        <p className={`font-semibold ${
                          p.status === 'angekommen' ? 'text-green-600' : 'text-slate-600'
                        }`}>
                          {p.status === 'angekommen' ? '✓ Angekommen' : 'Ausstehend'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setShowDetails(showDetails === p.id ? null : p.id)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                    >
                      📋 Details
                    </button>
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                    >
                      <option value="angekommen">Angekommen</option>
                      <option value="gesund">Gesund</option>
                      <option value="krank">Krank</option>
                    </select>
                  </div>
                </div>

                {/* Details */}
                {showDetails === p.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">📧 Email</p>
                        <p className="font-medium">{p.tn_email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">📱 Telefon</p>
                        <p className="font-medium">{p.tn_telefon || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">🎂 Geburtstag</p>
                        <p className="font-medium">
                          {p.tn_geburtsdatum ? new Date(p.tn_geburtsdatum).toLocaleDateString('de-DE') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">⚕️ Versicherung</p>
                        <p className="font-medium">{p.krankenkasse || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-slate-600">⚠️ Allergien</p>
                        <p className="font-medium">{p.allergien || 'Keine'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-slate-600">📝 Bemerkungen</p>
                        <p className="font-medium">{p.besonderheiten || 'Keine'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
