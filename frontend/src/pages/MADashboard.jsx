import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import PhotoUpload from '../components/PhotoUpload'
import ActivityGenerator from '../components/ActivityGenerator'
import PocketMoneyManagement from '../components/PocketMoneyManagement'

export default function MADashboard({ onLogout }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [participants, setParticipants] = useState([])
  const [checkInStatus, setCheckInStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)

      const token = localStorage.getItem('token')

      // Load participants
      try {
        const partResponse = await api.get('/participants/?camp_id=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setParticipants(partResponse.data || [])
      } catch (err) {
        console.error('Error loading participants:', err)
      }

      // Load check-in status
      try {
        const checkResponse = await api.get('/check-in/status/1', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setCheckInStatus(checkResponse.data)
      } catch (err) {
        console.error('Error loading check-in status:', err)
      }
    } catch (err) {
      setError('Fehler beim Laden der Daten')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⛺</div>
            <div>
              <h1 className="text-2xl font-bold text-navy">BULA2026 Mitarbeiter Dashboard</h1>
              <p className="text-sm text-slate-500">Lagerverwaltung & Koordination</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-right">
                <p className="font-semibold text-navy">{user.vorname} {user.nachname}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Übersicht' },
            { id: 'participants', label: '👥 Teilnehmer' },
            { id: 'check-in', label: '✓ Check-In' },
            { id: 'photos', label: '📸 Fotos' },
            { id: 'activities', label: '🎯 Aktivitäten' },
            { id: 'pocket-money', label: '💰 Taschengeld' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gold text-navy'
                  : 'border-transparent text-slate-600 hover:text-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-slate-600">Daten werden geladen...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {checkInStatus && (
                    <>
                      <div className="card">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">✓</div>
                          <div>
                            <p className="text-sm text-slate-600 font-medium">Angekommen</p>
                            <p className="text-3xl font-bold text-green-600">{checkInStatus.checked_in || 0}</p>
                            <p className="text-xs text-slate-500">{checkInStatus.percentage || 0}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">⏳</div>
                          <div>
                            <p className="text-sm text-slate-600 font-medium">Fehlen noch</p>
                            <p className="text-3xl font-bold text-yellow-600">{checkInStatus.pending || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">👥</div>
                          <div>
                            <p className="text-sm text-slate-600 font-medium">Gesamt</p>
                            <p className="text-3xl font-bold text-navy">{checkInStatus.total || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">🏕️</div>
                          <div>
                            <p className="text-sm text-slate-600 font-medium">Status</p>
                            <p className="text-xl font-bold text-green-600">✓ Online</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {checkInStatus && checkInStatus.percentage && (
                  <div className="card">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Check-In Fortschritt</p>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${checkInStatus.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {checkInStatus.checked_in} von {checkInStatus.total} Teilnehmern ({checkInStatus.percentage}%)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-navy mb-6">Teilnehmer ({participants.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-navy font-semibold">ID</th>
                        <th className="px-4 py-3 text-navy font-semibold">Name</th>
                        <th className="px-4 py-3 text-navy font-semibold">Zelt</th>
                        <th className="px-4 py-3 text-navy font-semibold">Status</th>
                        <th className="px-4 py-3 text-navy font-semibold">Check-In</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map(p => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-700">{p.id}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium">TN {p.id}</td>
                          <td className="px-4 py-3 text-slate-700">{p.zelt_id ? `Zelt ${p.zelt_id}` : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              p.status === 'angekommen'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {p.status === 'angekommen' ? '✓ Angekommen' : 'Ausstehend'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{p.check_in_time ? '✓' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Check-In Tab */}
            {activeTab === 'check-in' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-navy mb-6">Check-In Management</h2>
                {checkInStatus && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-lg font-semibold text-green-800">
                        ✓ {checkInStatus.checked_in || 0} von {checkInStatus.total || 0} Teilnehmern eingetroffen
                      </p>
                      <p className="text-sm text-green-700 mt-1">Fortschritt: {checkInStatus.percentage || 0}%</p>
                    </div>

                    {checkInStatus.pending_participants && checkInStatus.pending_participants.length > 0 ? (
                      <div>
                        <h3 className="font-semibold text-navy mb-3">⏳ Noch nicht eingetroffen:</h3>
                        <div className="space-y-2">
                          {checkInStatus.pending_participants.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-yellow-50 transition-colors">
                              <span className="text-slate-700">{p.name} {p.zelt ? `(${p.zelt})` : ''}</span>
                              <button className="px-4 py-2 bg-gold text-navy rounded-lg hover:bg-gold/80 transition-colors font-semibold text-sm">
                                ✓ Check-In
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-600">✓ Alle Teilnehmer sind eingetroffen!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <PhotoUpload campId={1} />
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <ActivityGenerator campId={1} />
            )}

            {/* Pocket Money Tab */}
            {activeTab === 'pocket-money' && (
              <PocketMoneyManagement campId={1} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
