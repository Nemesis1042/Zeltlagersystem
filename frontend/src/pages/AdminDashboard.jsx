import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [participants, setParticipants] = useState([])
  const [checkInStatus, setCheckInStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUser()
    loadParticipants()
    loadCheckInStatus()
  }, [])

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setUser(response.data)
    } catch (err) {
      navigate('/login')
    }
  }

  const loadParticipants = async () => {
    try {
      const response = await axios.get('/api/participants/?camp_id=1')
      setParticipants(response.data)
    } catch (err) {
      console.error('Error loading participants:', err)
    }
  }

  const loadCheckInStatus = async () => {
    try {
      const response = await axios.get('/api/check-in/status/1')
      setCheckInStatus(response.data)
    } catch (err) {
      console.error('Error loading check-in status:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BULA2026 Admin Panel</h1>
          <div className="flex items-center space-x-4">
            {user && <span className="text-gray-700">{user.vorname} {user.nachname}</span>}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            📊 Übersicht
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-2 px-4 ${activeTab === 'participants' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            👥 Teilnehmer
          </button>
          <button
            onClick={() => setActiveTab('check-in')}
            className={`py-2 px-4 ${activeTab === 'check-in' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            ✓ Check-In
          </button>
          <button
            onClick={() => setActiveTab('tents')}
            className={`py-2 px-4 ${activeTab === 'tents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            🏕️ Zeltplätze
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-4 ${activeTab === 'activities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            🎯 Aktivitäten
          </button>
          <button
            onClick={() => setActiveTab('pocket-money')}
            className={`py-2 px-4 ${activeTab === 'pocket-money' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            💰 Taschengeld
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {checkInStatus && (
              <>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Angekommen</h3>
                  <p className="text-3xl font-bold text-green-600">{checkInStatus.checked_in}/{checkInStatus.total}</p>
                  <p className="text-xs text-gray-500">{checkInStatus.percentage}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Fehlen noch</h3>
                  <p className="text-3xl font-bold text-red-600">{checkInStatus.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Teilnehmer Total</h3>
                  <p className="text-3xl font-bold text-blue-600">{participants.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">System Status</h3>
                  <p className="text-lg font-bold text-green-600">✓ Online</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Participants */}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Teilnehmer ({participants.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Zelt</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Check-In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{p.id}</td>
                        <td className="px-4 py-2">TN {p.id}</td>
                        <td className="px-4 py-2">{p.zelt_id ? `Zelt ${p.zelt_id}` : 'Nicht zugewiesen'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${p.status === 'angekommen' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{p.check_in_time ? '✓' : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Check-In */}
        {activeTab === 'check-in' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Check-In Management</h2>
            {checkInStatus && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <p className="text-lg font-semibold text-green-800">
                    ✓ {checkInStatus.checked_in} von {checkInStatus.total} Teilnehmern angekommen ({checkInStatus.percentage}%)
                  </p>
                </div>

                {checkInStatus.pending_participants.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Noch nicht eingetroffen:</h3>
                    <div className="space-y-2">
                      {checkInStatus.pending_participants.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                          <span>{p.name} ({p.zelt})</span>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            ✓ Check-In
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tents */}
        {activeTab === 'tents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🏕️ Zeltplatz-Management</h2>
            <p className="text-gray-600">Zeltplatz-Zuordnung kommt bald...</p>
          </div>
        )}

        {/* Activities */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🎯 Aktivitäten & Gruppen-Generator</h2>
            <p className="text-gray-600">Aktivitäten-Verwaltung kommt bald...</p>
          </div>
        )}

        {/* Pocket Money */}
        {activeTab === 'pocket-money' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">💰 Taschengeld-System</h2>
            <p className="text-gray-600">Taschengeld & QR-Scanner kommt bald...</p>
          </div>
        )}
      </main>
    </div>
  )
}
