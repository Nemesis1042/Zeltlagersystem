import { useCamp } from '../context/CampContext'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import StaffLayout from '../components/StaffLayout'

export default function StaffParticipants({ onLogout }) {
  const { campId } = useCamp()
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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
    return participants.filter(p =>
      p.tn_vorname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tn_familienname?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredParticipants = getFilteredParticipants()

  if (loading) {
    return (
      <StaffLayout onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-slate-600">Teilnehmer werden geladen...</p>
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2">👥 Teilnehmer</h2>
          <p className="text-slate-600">Übersicht aller Teilnehmer</p>
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

        {/* Search */}
        <div className="card">
          <input
            type="text"
            placeholder="Nach Namen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* List */}
        {filteredParticipants.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600">Keine Teilnehmer gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto card">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-800 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-slate-800 font-semibold">Zelt</th>
                  <th className="px-4 py-3 text-left text-slate-800 font-semibold">Check-In</th>
                  <th className="px-4 py-3 text-left text-slate-800 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-slate-800 font-semibold">Allergien</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.tn_vorname} {p.tn_familienname}</td>
                    <td className="px-4 py-3">{p.zelt_name || (p.zelt_id ? `Zelt ${p.zelt_id}` : '-')}</td>
                    <td className="px-4 py-3">
                      {p.check_in_time ? '✓ ' + new Date(p.check_in_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'angekommen'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.status === 'angekommen' ? '✓ Angekommen' : 'Ausstehend'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.allergien ? '⚠️ ' + p.allergien : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StaffLayout>
  )
}
